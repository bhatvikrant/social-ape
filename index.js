/* eslint-disable */

const functions = require("firebase-functions");
const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { db } = require("./util/admin");

const {
	getAllScreams,
	postOneScream,
	getScream,
	commentonScream,
	deleteScream,
	likeScream,
	unlikeScream,
} = require("./handlers/screams");
const {
	signup,
	login,
	uploadImage,
	addUserDetails,
	getAuthenticatedUser,
	getuserDetails,
	markNotificationsRead,
} = require("./handlers/users");

// SCREAM ROUTES
app.get("/screams", getAllScreams); // Get all screams
app.post("/scream", FBAuth, postOneScream); // Post a scream
app.get("/scream/:screamId", getScream);
app.delete("/scream/:screamId", FBAuth, deleteScream);
app.get("/scream/:screamId/like", FBAuth, likeScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
app.post("/scream/:screamId/comment", FBAuth, commentonScream);

// TODO: delete scream. like/unlike scream

// USER ROUTES
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getuserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

// LIKE NOTIFICATION
exports.createNotificationOnLike = functions.firestore
	.document("likes/{id}")
	.onCreate(snapshot => {
		return db
			.doc(`/screams/${snapshot.data().screamId}`)
			.get()
			.then(doc => {
				if (
					doc.exists &&
					doc.data().userHandle !== snapshot.data().userHandle
				) {
					return db.doc(`/notifications/${snapshot.id}`).set({
						createdAt: new Date().toISOString(),
						recipient: doc.data().userHandle,
						sender: snapshot.data().userHandle,
						type: "like",
						read: false,
						screamId: doc.id,
					});
				}
			})
			.catch(err => console.error(err));
	});

// DELETE NOTIFICATION ON UNLIKE
exports.deleteNotificationOnUnlike = functions.firestore
	.document("likes/{id}")
	.onDelete(snapshot => {
		return db
			.doc(`/notifications/${snapshot.id}`)
			.delete()
			.catch(err => {
				console.error(err);
				return;
			});
	});

// COMMENT NOTIFICATION
exports.createNotificationOnComment = functions.firestore
	.document("comments/{id}")
	.onCreate(snapshot => {
		return db
			.doc(`/screams/${snapshot.data().screamId}`)
			.get()
			.then(doc => {
				if (
					doc.exists &&
					doc.data().userHandle !== snapshot.data().userHandle
				) {
					return db.doc(`/notifications/${snapshot.id}`).set({
						createdAt: new Date().toISOString(),
						recipient: doc.data().userHandle,
						sender: snapshot.data().userHandle,
						type: "comment",
						read: false,
						screamId: doc.id,
					});
				}
			})
			.catch(err => {
				console.error(err);
				return;
			});
	});

// UPDATE PROFILE IMG ON ALL SCREAMS WHEN USER CHANGES HIS PROFILE IMG
exports.onUserImageChange = functions.firestore
	.document("/users/{userId}")
	.onUpdate(change => {
		console.log(change.before.data());
		console.log(change.after.data());
		if (change.before.data().imageUrl !== change.after.data().imageUrl) {
			console.log("Image changed");
			const batch = db.batch();
			return db
				.collection("screams")
				.where("userHandle", "==", change.before.data().handle)
				.get()
				.then(data => {
					data.forEach(doc => {
						const scream = db.doc(`/screams/${doc.id}`);
						batch.update(scream, { userImage: change.after.data().imageUrl });
					});
					return batch.commit();
				});
		} else return true;
	});

// DELETE ALL DATA (comments, likes, notifications) RELATED TO SCREAM IF THE SCREAM IS DELETED
exports.onScreamDelete = functions.firestore
	.document("/screams/{screamId}")
	.onDelete((snapshot, context) => {
		const screamId = context.params.screamId;
		const batch = db.batch();
		return db
			.collection("comments")
			.where("screamId", "==", screamId)
			.get()
			.then(data => {
				data.forEach(doc => {
					batch.delete(db.doc(`/comments/${doc.id}`));
				});

				return db.collection("likes").where("screamId", "==", screamId).get();
			})
			.then(data => {
				data.forEach(doc => {
					batch.delete(db.doc(`/likes/${doc.id}`));
				});

				return db
					.collection("notifications")
					.where("screamId", "==", screamId)
					.get();
			})
			.then(data => {
				data.forEach(doc => {
					batch.delete(db.doc(`/notifications/${doc.id}`));
				});

				return batch.commit();
			})
			.catch(err => console.error(err));
	});
