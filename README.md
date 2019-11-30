## Functions

* Comment
    * [fbTools.cmt.add](#cmtadd)
    * [fbTools.cmt.del](#cmtdel)
* Conversation
    * [fbTools.conversation.changeNickname](#conversationchangenickname)
    * [fbTools.conversation.changeEmoji](#conversationchangeemoji)
    * [fbTools.conversation.chat](#conversationchat)
    * [fbTools.conversation.del](#conversationdel)
    * [fbTools.conversation.typing](#conversationtyping)
* Group
    * [fbTools.group.addMem](#groupaddmem)
    * [fbTools.group.create](#groupcreate)
    * [fbTools.group.kick](#groupkick)
    * [fbTools.group.unban](#groupunban)
    * [fbTools.group.mute](#groupmute)
    * [fbTools.group.notification](#groupnotification)
    * [fbTools.group.leave](#groupleave)
    * [fbTools.group.unfollow](#groupunfollow)
    * Post
        * [fbTools.group.post.del](#grouppostdel)
        * [fbTools.group.post.disableCmt](#grouppostdisableCmt)
        * [fbTools.group.post.offNotification](#grouppostoffNotification)
* Friend Request
    * [fbTools.friendRequest](#friendrequest)
* Me
    * Block
        * [fbTools.me.block.page](#meblockpage)
        * [fbTools.me.block.user](#meblockuser)
    * [fbTools.me.unblock](#meunblock)
    * [fbTools.me.unfriend](#meunfriend)
    * [fbTools.me.unfollow](#meunfollow)
    * [fbTools.me.poke](#mepoke)
    * Post
        * [fbTools.me.post.del](#mepostdel)
        * [fbTools.me.post.offNotification](#mepostoffNotification)
* Page
    * [fbTools.page.inviteLike](#pageinvitelike)
    * [fbTools.page.like](#pagelike)
* [fbTools.reaction](#reaction)

* Most function return a Promise with value true.

### cmt.add
```fbTools.cmt.add(obj)```

Object | Type | Description
-|-|-
sticker | Integer (Optional) | ID of sticker
post | Integer | Post you want to comment to
cmt | String | Your comment (Of course)
reply | Integer (Optional) | ID of comment you want to reply
url | String (Optional) | URL you want to embed with your comment

### cmt.del
```fbTools.cmt.del(postId, cmtId)```

Parameters | Type | Description
-|-|-
postId | Integer | ID of post contains comment you want to delete
cmtId | Integer | ID of comment

<hr>

### conversation.changeNickname
```fbTools.conversation.changeNickname(id, nickname, threadId)```

Parameters | Type | Description
-|-|-
id | Integer | User ID
nickname | String | Nickname you want to set
threadId | Integer (Optional) | Add this parameter if you want to change nickname of someone in group chat

### conversation.changeEmoji
```fbTools.conversation.changeEmoji(threadId, icon)```

Parameter | Type | Description
-|-|-
threadId | Integer | ID of chat thread
icon | String | Emoji like this "😂" or Escaped Unicode String

### conversation.chat
```fbTools.conversation.chat(obj)```

Object | Type | Description
-|-|-
audio | Integer (Optional) | ID of audio
emoji | String (Optional) | Emoji like this "😂" or Escaped Unicode String
emoji_size | String (Optional) | Pick one: "small" "medium" "large"
thread | Integer (Optional) | ID of chat thread
img | Integer (Optional) | ID of Image
message | String (Optional) | Your chat message
sticker | Integer (Optional) | ID of sticker
user | Integer | ID of user
video | Integer (Optional) | ID of video
kick | Integer (Optional) | ID of user you want to kick out of a chat thread

* If you want to send message to chat thread, use object "thread" instead of "user".

### conversation.del
```fbTools.conversation.del(threadId)```

Parameter | Type | Description
-|-|-
threadId | Integer | ID of User or Thread

### conversation.typing
```fbTools.conversation.typing(userId, typ)```

Parameter | Type | Description
-|-|-
userId | Integer | ID of User or Thread
typ | Integer | 0 = Stop / 1 = Typing...

<hr>

### group.addMem
```fbTools.group.addMem(groupId, userId)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
userId | Integer | ID of member (User)

### group.create
```fbTools.group.create(groupName, privacy, discov, memIds)```

Parameter | Type | Description
-|-|-
groupName | String | Name of new group
privacy | string | Pick one: "secret", "open"
discov | string | Pick one: "members_only", "anyone"
memIds | Array | Array of user you want them to be group member

### group.kick
```fbTools.group.kick(groupId, memberId, block)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
memberId | Integer | ID of member (User)
block | Integer | 0 = No block / 1 = Block user

### group.unban
```fbTools.group.unban(groupId, memberId)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
memberId | Integer | ID of member (User)

### group.mute
```fbTools.group.mute(groupId, memberId)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
memberId | Integer | ID of member (User)

### group.notification
```fbTools.group.notification(groupId, level)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
level | Integer | Level Of Notification 

Integer | Level
-|-
1 | Off
2 | Friends
3 | All
6 | Highlight

### group.leave
```fbTools.group.leave(groupId, reAdd)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
reAdd | Boolean | Do you want to let that group add you in again? Use boolean ;)

### group.unfollow
```fbTools.group.leave(groupId, follow)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
follow | Integer | 1 = Unfollow / 0 = Follow

### group.post.del
```fbTools.group.post.del(groupId, postId)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
postId | Integer | ID of post

### group.post.disableCmt
```fbTools.group.post.disableCmt(postId, cmt)```

Parameter | Type | Description
-|-|-
postId | Integer | ID of post
cmt | Integer | 1 = Disable / 0 = Enable

### group.post.offNotification
```fbTools.group.post.del(groupId, postId, follow)```

Parameter | Type | Description
-|-|-
groupId | Integer | ID of group
postId | Integer | ID of post
follow | Integer | 1 = Turn On Notification / 0 = Turn off

<hr>

### friendRequest
```fbTools.friendRequest.accept(userId, act)```

Parameter | Type | Description
-|-|-
userId | Integer | ID of User
act | Boolean | true = accept / false = reject

<hr>

### me.block.page
```fbTools.me.block.page(pageId)```

Parameter | Type | Description
-|-|-
pageId | Integer | ID of Page

### me.block.user
```fbTools.me.block.user(userId)```

Parameter | Type | Description
-|-|-
userId | Integer | ID of User

### me.unblock
```fbTools.me.unblock(userId)```

Parameter | Type | Description
-|-|-
userId | Integer | ID of User

### me.unfriend
```fbTools.me.unfriend(userId)```

Parameter | Type | Description
-|-|-
userId | Integer | ID of User

### me.unfollow
```fbTools.me.unfollow(userId)```

Parameter | Type | Description
-|-|-
userId | Integer | ID of User

### me.poke
```fbTools.me.poke(userId)```

Parameter | Type | Description
-|-|-
userId | Integer | ID of User

### me.post.del
```fbTools.me.post.del(postId)```

Parameter | Type | Description
-|-|-
postId | Integer | ID of Post

### me.post.offNotification
```fbTools.me.post.offNotification(postId, follow)```

Parameter | Type | Description
-|-|-
postId | Integer | ID of post
follow | Integer | 1 = Turn On Notification / 0 = Turn off

<hr>

### page.inviteLike
```fbTools.page.inviteLike(pageId, arrInvite, inviteMessage)```

Parameter | Type | Description
-|-|-
pageId | Integer | ID of Page
arrInvite | Array of Integer | IDs of people you want to invite to like your page
inviteMessage | String | Message they'll receive with the invite.

### page.like
```fbTools.page.like(pageId, act)```

Parameter | Type | Description
-|-|-
pageId | Integer | ID of Page
act | Boolean | true => Like / false => Unlike

<hr>

### reaction
```fbTools.reaction(postId, reactType)```

Parameters | Type | Description
-|-|-
postId | Integer | ID of a Post
reactType | Integer | Reaction Type

Integer | Reaction Type
-|-
0 | None
1 | Like
2 | Love
3 | Wow
4 | Haha
7 | Sad
8 | Angry

<hr>

# Check
Last Check: 08:30 PM Mon Oct 28 2019 (UTC)

Function | Checked? | Works?
-|-|-
cmt.add | + | +
cmt.del | + | +
conversation.changeNickname | + | +
conversation.changeEmoji | + | +
conversation.chat | + | +
conversation.del | + | +
conversation.typing | - | ?
group.addMem | - | ?
group.create | - | ?
group.kick | - | ?
group.unban | - | ?
group.mute | - | ?
group.leave | + | +
group.notification | + | +
group.unfollow | + | +
group.post.del | - | ?
group.post.disableCmt | + | +
group.post.offNotification | + | +
friendRequest | - | ?
me.block.page | - | ?
me.block.user | - | ?
me.unblock | - | ?
me.unfriend | - | ?
me.unfollow | - | ?
me.poke | - | ?
me.post.del | + | +
me.post.offNotification | + | +
page.inviteLike | - | ?
page.like | - | ?
reaction | + | +