let db = {
	users: [
		{
			userId: "wer12324wqd12323",
			email: "user@email.com",
			handle: "user",
			body: "this is the scream body",
			createdAt: "2020-06-13T14:56:47.481Z",
			imageUrl: "",
			bio: "hello this is my bio",
			website: "https://user.com",
			location: "London, UK",
		},
	],
	screams: [
		{
			useHandle: "users unique handle",
			body: "this is the scream body",
			createdAt: "2020-06-13T14:56:47.481Z",
			likeCount: 5,
			commentCount: 2,
		},
	],
	comments: [
		{
			useHandle: "user",
			screamId: "",
			body: "nice one mate!",
			createdAt: "2020-06-13T14:56:47.481Z",
		},
	],
	notifications: [
		{
			recipient: "user",
			sender: "john",
			read: "true | false",
			screamId: "",
			type: "like | comment",
			createdAt: "",
		},
	],
};

const userDetails = {
	// REDUX data
	credentials: {
		userId: "",
		email: "",
		handle: "",
		createdAt: "",
		imageUrl: "",
		bio: "",
		website: "",
		location: "",
	},
	likes: [
		{
			userHandle: "user",
			screamId: "",
		},
		{
			userHandle: "user",
			screamId: "",
		},
	],
};
