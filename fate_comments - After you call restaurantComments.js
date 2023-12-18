[
  /**
   * This output represents a tree structure where "Fake Restaurant 1"
   * has two comments ("Comment 1" and "Comment 2"), and "Comment 1"
   * has a reply ("Reply 1").
   * Notice: 这里的数据需要把[]去掉。这里存成list是因为不这样存vscode给我报错。
   * 假设读取到了 const jsonObject = JSON.parse(data);
   * 真实的call function "/restaurantComments" 的返回值是 jsonObject[0]
   * 这个function可以在后端NodeRouter里面的最下面找到
   *
   * 这个数据是针对一个restaurant所有的comment，input是一个restaurant id，返回所有针对这个retaurant的comment
   */
  {
    node: {
      type: "restaurant",
      content: "This is a fake restaurant",
      filePath: {
        path: [],
        children: [],
      },
      nodeId: "rest1",
      title: "Fake Restaurant 1",
      dateCreated: "2023-11-27T12:34:56.789Z",
      lat: 40.7128,
      lng: -74.006,
      imageIds: ["img1", "img2"],
      openingTimes: ["08:00 AM", "12:00 PM"],
      closingTimes: ["06:00 PM", "10:00 PM"],
      categories: ["Italian", "Pizza"],
      createdBy: "user1",
    },
    children: [
      //the reply to the above comments
      {
        node: {
          type: "comment",
          content: "Great food!",
          filePath: {
            path: [],
            children: [],
          },
          nodeId: "comment1",
          title: "Comment 1",
          dateCreated: "2023-11-27T12:34:56.789Z",
          commentTo: "rest1",
          createdBy: "user2",
        },
        children: [
          {
            node: {
              type: "comment",
              content: "Thank you!",
              filePath: {
                path: [],
                children: [],
              },
              nodeId: "reply1",
              title: "Reply 1",
              dateCreated: "2023-11-27T12:34:56.789Z",
              commentTo: "comment1",
              createdBy: "user4",
            },
            children: [],
          },
        ],
      },
      {
        node: {
          type: "comment",
          content: "I enjoyed my meal.",
          filePath: {
            path: [],
            children: [],
          },
          nodeId: "comment2",
          title: "Comment 2",
          dateCreated: "2023-11-27T12:34:56.789Z",
          commentTo: "rest1",
          createdBy: "user3",
        },
        children: [],
      },
    ],
  },
];
