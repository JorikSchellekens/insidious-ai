export default {
  "users": {
    "allow": {
      "view": "true",
      "create": "true",
      "update": "auth.id == data.id",
      "delete": "false"
    }
  },
  "transformers": {
    "allow": {
      "view": "true",
      "create": "auth.id != null",
      "update": "auth.id == data.authorId",
      "delete": "auth.id == data.authorId"
    }
  },
  "likes": {
    "allow": {
      "view": "true",
      "create": "auth.id != null",
      "update": "false",
      "delete": "auth.id == data.userId"
    }
  },
  "bookmarks": {
    "allow": {
      "view": "auth.id == data.userId",
      "create": "auth.id != null",
      "update": "false",
      "delete": "auth.id == data.userId"
    }
  }
}