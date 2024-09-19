export default {
  "userSettings": {
    "bind": [
      "isOwner",
      "auth.id == data.id"
    ],
    "allow": {
      "view": "isOwner",
      "create": "true",
      "delete": "isOwner",
      "update": "isOwner"
    }
  },
  "transformers": {
    "bind": [
      "isOwner",
      "auth.id == data.authorId"
    ],
    "allow": {
      "view": "true",
      "create": "true",
      "delete": "false",
      "update": "isOwner"
    }
  }
}