var fbTools = {
	conv: {
		query: function(obj) {
			// Input: {a: "asdf", b: "sd"} Output: ?a=asdf&b=sd
			return `?${Object.keys(obj).map((key) => `${key}=${obj[key]}.`).join("&")}`;
		},
		form: function(obj) {
			// Input: {a: "asdf", b: "sd"} Output: FormData
			let f = new FormData();
			Object.keys(obj).forEach((key) => {f.append(key, obj[key]);});
			return f;
		}
	},

	cmt: {
		add: async function(obj) {
			// Object Supported: {sticker: 123, post: 123, cmt: "your cmt", reply: 123, url: "https://www.youtube.com/"}
			let f = {
				client_id: "1489983090155:3363757627",
				fb_dtsg: await fbTools.get.dtsg(),
				session_id: "84d81e4",
				source: 2
			};
			Object.keys(obj).forEach((key) => {
				if (key == "sticker" && !!obj[key]) {
					f.attached_sticker_fbid = obj[key];
				} else if (key == "post" && !!obj[key]) {
					f.ft_ent_identifier = obj[key];
				} else if (key == "cmt" && !!obj[key]) {
					f.comment_text = obj[key];
				} else if (key == "reply" && !!obj[key]) {
					f.reply_fbid = obj[key];
					f.parent_comment_id = `${obj["post"]}_${obj[key]}`;
				} else if (key == "url" && !!obj[key]) {
					f.attached_share_url = obj[key];
				} else {
					console.log(`Key: ${key} - Value: ${obj[key]} is not supported.`);
				}
			});
			return fetch("https://www.facebook.com/ufi/add/comment/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		del: async function(postId, cmtId) {
			let f = {
				client_id: "1489983090155:3363757627",
				comment_id: `${postId}_${cmtId}`,
				comment_legacyid: cmtId,
				fb_dtsg: await fbTools.get.dtsg(),
				ft_ent_identifier: postId,
				source: 2
			};
			return fetch("https://www.facebook.com/ufi/delete/comment/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		}
	},

	conversation: {
		changeNickname: async function(id, nickName, threadId = id) {
			let f = {
				fb_dtsg: await fbTools.get.dtsg(),
				nickname: nickName,
				participant_id: id,
				thread_or_other_fbid: threadId
			};
			return fetch("https://www.facebook.com/messaging/save_thread_nickname/?source=thread_settings", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		changeEmoji: async function(threadId, icon) {
			let f = {
				thread_or_other_fbid: threadId,
				emoji_choice: JSON.parse(`"${icon}"`),
				fb_dtsg: await fbTools.get.dtsg()
			};
			return fetch("https://www.facebook.com/messaging/save_thread_emoji/?source=thread_settings", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		chat: async function(obj) {
			// Object Supported: {audio: 123, emoji: "😂", emoji: "\uD83D\uDE02", emoji_size: "Pick one: small medium large", image: 123, message: "your cmt", sticker: 123, thread: 123, user: 123, video: 123, kick: 123}
			let mId = Math.floor(Math.random() * 999999999),
				f = {
					action_type: "ma-type:user-generated-message",
					client: "mercury",
					ephemeral_ttl_mode: 0,
					fb_dtsg: await fbTools.get.dtsg(),
					has_attachment: false,
					message_id: mId,
					offline_threading_id: mId,
					source: "source:titan:web",
					timestamp: Date.now()
				};
			Object.keys(obj).forEach((key) => {
				if (key == "thread" && !!obj[key]) {
					f.thread_fbid = obj[key];
				} else if (key == "message" && !!obj[key]) {
					f.body = obj[key];
				} else if (key == "sticker" && !!obj[key]) {
					f.has_attachment = true;
					f.sticker_id = obj[key];
				} else if (key == "user" && !!obj[key]) {
					f.other_user_fbid = obj[key];
				} else if (key == "kick" && !!obj[key]) {
					f.action_type = "ma-type:log-message";
					f.log_message_type = "log:unsubscribe";
					f["log_message_data[removed_participants][0]"] = `fbid:${obj[key]}`;
				} else if (key == "image" && !!obj[key]) {
					f.has_attachment = true;
					if (typeof(obj[key]) == "string" || typeof(obj[key]) == "number") {
						f["image_ids[0]"] = obj[key];
					} else if (typeof(obj[key]) == "object") {
						obj[key].forEach((id, item) => f[`image_ids[${item}]`] = id);
					}
				} else if (key == "audio" && !!obj[key]) {
					f["audio_ids[0]"] = obj[key];
				} else if (key == "video" && !!obj[key]) {
					f["video_ids[0]"] = obj[key];
				} else if (key == "emoji" && !!obj[key]) {
					f.body = JSON.parse(`"${obj[key]}"`);
				} else if (key == "emoji_size" && !!obj[key]) {
					f["tags[0]"] = `hot_emoji_size:${obj[key]}`;
				} else {
					console.log(`Key: ${key} - Value: ${obj[key]} is not supported.`);
				}
			});
			return fetch("https://www.facebook.com/messaging/send/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		del: async function(threadId) {
			let f = {
				"ids[0]": threadId,
				fb_dtsg: await fbTools.get.dtsg()
			};
			return fetch("https://www.facebook.com/ajax/mercury/delete_thread.php", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
        typing: async function(userId, typ) {
        	// typ = 0 or 1
            let f = {
                fb_dtsg: await fbTools.get.dtsg(),
                source: "mercury-chat",
                thread: userId,
                to: userId,
                typ: typ
            };
            return fetch(`https://www.facebook.com/ajax/messaging/typ.php`, {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
        }
	},

	get: {
		dtsg: function() {return require("DTSGInitialData").token || document.querySelector('[name="fb_dtsg"]').value;},
		groupId: function(url) {return fetch(url).then((res) => res.text()).then((res) => res.match(/(?<=membership_group_id:)\d+(?=,)/g)[0]);},
		pageId: function(url) {return fetch(url).then((res) => res.text()).then((res) => res.match(/(?<=page_id:")\d+(?=")/g)[0]);},
		postId: function(url) {return fetch(url).then((res) => res.text()).then((res) => res.match(/(?<=name="ft_ent_identifier"\svalue=")\d+(?=")/g));},
		userId: function(url) {return fetch(url).then((res) => res.text()).then((res) => res.match(/(?<=entity_id":")\d+(?=")/g)[0]);},
		myId: function() {return require("CurrentUserInitialData").USER_ID || document.cookie.match(/c_user=([0-9]+)/)[1];}
	},

	group: {
		addMem: async function(groupId, memberId) {
			let f = {
				"members[0]": memberId,
				fb_dtsg: await fbTools.get.dtsg(),
				group_id: groupId,
				message_id: "groupsAddMemberCompletionMessage",
				source: "suggested_members_new"
			};
			return fetch("https://www.facebook.com/ajax/groups/members/add_post/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		create: async function(groupName, privacy, discov, memIds) {
			// Group Privacy Supported: secret | open (Case Sensitive)
			// Group Discoverability: members_only | anyone
			// memIds: Array of user you want them to be group member
			let f = {
				fb_dtsg: await fbTools.get.dtsg(),
				ref: "discover_groups",
				"purposes[0]": "",
				name: groupName,
				privacy: privacy,
				discoverability: discov
			};
			if (memIds) memIds.forEach((id, index) => {f[`members[${index}`] = id;});
			return fetch("https://www.facebook.com/ajax/groups/create_post/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		kick: async function(groupId, memberId, block = 0) {
			let f = {
				block_user: block,
				confirmed: true,
				fb_dtsg: await fbTools.get.dtsg()
			}, q = {
				group_id: groupId,
				is_undo: 0,
				member_id: memberId,
				source: "profile_browser"
			}, status = "Kicked";
			(!block) ? (status = "Kicked") : (status = "Kicked & Blocked");
			return fetch(`https://www.facebook.com/ajax/groups/remove_member/${fbTools.conv.query(q)}`, {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		unban: async function(groupId, memberId) {
			let f = {
				fb_dtsg: await fbTools.get.dtsg(),
				remove_block: 1
			}, q = {
				group_id: groupId,
				operation: "confirm_remove_block",
				source: "profilebrowser_blocked",
				user_id: memberId
			};
			return fetch(`https://www.facebook.com/ajax/groups/admin_post/${fbTools.conv.query(q)}`, {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		mute: async function(groupId, memberId) {
			let f = {
				fb_dtsg: await fbTools.get.dtsg(),
				group_id: groupId,
				mute_duration: "seven_days",
				should_reload: false,
				source: "profile_browser",
				user_id: memberId
			};
			return fetch("https://www.facebook.com/groups/mutemember/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		notification: async function(groupId, level) {
			// Supscription Level: 6 - Highlight | 3 - All | 2 - Friends | 1 - Off
			let f = {
				fb_dtsg: await fbTools.get.dtsg()
			};
			return fetch(`https://www.facebook.com/groups/notification/settings/edit/?group_id=${groupId}&subscription_level=${level}`, {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		leave: async function(groupId, reAdd) {
			// reAdd = Boolean, Which accept anyone invite you to join group again, default: false = they still can add you to group
			let f = {
				confirmed: 1,
				fb_dtsg: await fbTools.get.dtsg()
			};
			(reAdd) ? (f.prevent_readd = "on") : ("");
			return fetch(`https://www.facebook.com/ajax/groups/membership/leave/?group_id=${groupId}`, {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		unfollow: async function(groupId, follow) {
			// follow = 1 -> Unfollow | 0 -> Follow
			let f = {
				group_id: groupId,
				unfollow: follow,
				fb_dtsg: await fbTools.get.dtsg()
			};
			return fetch("https://www.facebook.com/groups/membership/unfollow_group/", {
					method: "POST",
					credentials: "include",
					body: fbTools.conv.form(f)
				}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		post: {
			del: async function(groupId, postId) {
				let f = {
					confirmed: 1,
					fb_dtsg: await fbTools.get.dtsg(),
					group_id: groupId,
					post_id: postId
				};
				return fetch("https://www.facebook.com/ajax/groups/mall/delete/", {
					method: "POST",
					credentials: "include",
					body: fbTools.conv.form(f)
				}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
			},
			disableCmt: async function(postId, cmt) {
				// cmt = 1 -> disable | 0 -> enable
				let f = {
					fb_dtsg: await fbTools.get.dtsg(),
					ft_ent_identifier: postId,
					disable_comments: cmt
				};
				return fetch("https://www.facebook.com/feed/ufi/disable_comments/", {
					method: "POST",
					credentials: "include",
					body: fbTools.conv.form(f)
				}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
			},
			offNotification: async function(groupId, postId, follow) {
				// follow = 0 -> Turn Off notification | 1 -> turn on notification
				let f = {
					fb_dtsg: await fbTools.get.dtsg(),
					group_id: groupId,
					message_id: postId,
					follow: follow
				};
				return fetch("https://www.facebook.com/ajax/litestand/follow_group_post", {
					method: "POST",
					credentials: "include",
					body: fbTools.conv.form(f)
				}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
			}
		}
	},

	friendRequest: {
		accept: async function(userId) {
			let f = {
				action: "confirm",
				fb_dtsg: await fbTools.get.dtsg(),
				id: userId
			};
			return fetch("https://www.facebook.com/requests/friends/ajax/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		reject: async function(userId) {
			let f = {
				action: "reject",
				fb_dtsg: await fbTools.get.dtsg(),
				id: userId
			};
			return fetch("https://www.facebook.com/requests/friends/ajax/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		}
	},

	me: {
		block: {
			page: async function(pageId) {
				let f = {
					confirmed: 1,
					fb_dtsg: await fbTools.get.dtsg(),
					page_id: pageId
				};
				return fetch("https://www.facebook.com/privacy/block_page/", {
					method: "POST",
					credentials: "include",
					body: fbTools.conv.form(f)
				}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
			},
			user: async function(id) {
				let f = {
					confirmed: 1,
					fb_dtsg: await fbTools.get.dtsg(),
					uid: id
				};
				return fetch("https://www.facebook.com/ajax/privacy/block_user.php", {
					method: "POST",
					credentials: "include",
					body: fbTools.conv.form(f)
				}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
			},
		},
		unblock: async function(userId) {
			let f = {
				fb_dtsg: await fbTools.get.dtsg(),
				privacy_source: "privacy_settings_page",
				uid: userId
			};
			return fetch("https://www.facebook.com/privacy/unblock_user/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		unfriend: async function(userId) {
			let f = {
				confirmed: 1,
				fb_dtsg: await fbTools.get.dtsg(),
				uid: userId
			};
			return fetch("https://www.facebook.com/ajax/profile/removefriendconfirm.php", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		unfollow: async function(id) {
			let f = {
				"nctr[_mod]": "pagelet_collections_following",
				fb_dtsg: await fbTools.get.dtsg(),
				location: 4,
				profile_id: id
			};
			return fetch("https://www.facebook.com/ajax/follow/unfollow_profile.php", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		poke: async function(userId) {
			let f = {
				fb_dtsg: await fbTools.get.dtsg()
			}, q = {
				poke_target: userId
			};
			return fetch(`https://www.facebook.com/pokes/dialog/${fbTools.conv.query(q)}`, {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		post: {
			del: async function(postId) {
				let f = {
					fb_dtsg: fbTools.get.dtsg()
				}, q = {
					identifier: `S:_I${fbTools.get.myId()}:${postId}`,
					is_notification_preview: 0,
					location: 9,
					render_location: 10
				};
				return fetch(`https://www.facebook.com/ajax/timeline/delete${fbTools.conv.query(q)}`, {
					method: "POST",
					credentials: "include",
					body: fbTools.conv.form(f)
				}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
			},
			offNotification: async function(groupId, postId, follow) {
				// follow = 0 -> Turn Off notification | 1 -> turn on notification
				let f = {
					fb_dtsg: await fbTools.get.dtsg(),
					message_id: postId,
					follow: follow
				};
				return fetch("https://www.facebook.com/ajax/litestand/follow_post", {
					method: "POST",
					credentials: "include",
					body: fbTools.conv.form(f)
				}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
			}
		}
	},

	page: {
		inviteLike: async function(pageId, arrInvite, inviteMessage) {
			let f = {
				fb_dtsg: await fbTools.get.dtsg(),
				invite_note: inviteMessage,
				page_id: pageId,
				ref: "modal_page_invite_dialog_v2",
				send_in_messenger: false
			};
			arrInvite.forEach((id, index, arr) => {f[`invitees[${index}]`] = id;});
			return fetch("https://www.facebook.com/pages/batch_invite_send/", {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		like: async function(pageId) {
			let f = {
				actor_id: fbTools.get.myId(),
				add: true,
				fb_dtsg: fbTools.get.dtsg(),
				fbpage_id: pageId,
				reload: false
			};
			return fetch(`https://www.facebook.com/ajax/pages/fan_status.php?av=${fbTools.get.myId()}`, {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		},
		unlike: async function(pageId) {
			let f = {
				actor_id: fbTools.get.myId(),
				add: false,
				fb_dtsg: fbTools.get.dtsg(),
				fbpage_id: pageId,
				reload: false
			};
			return fetch(`https://www.facebook.com/ajax/pages/fan_status.php?av=${fbTools.get.myId()}`, {
				method: "POST",
				credentials: "include",
				body: fbTools.conv.form(f)
			}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
		}
	},

	reaction: async function(postId, reactType) {
		// Reaction {none: 0, like: 1, love: 2, wow: 3, haha: 4, sad: 7, angry: 8}
		let f = {
			client_id: "1489983090155:3363757627",
			fb_dtsg: await fbTools.get.dtsg(),
			ft_ent_identifier: postId,
			reaction_type: reactType,
			session_id: "84d81e4",
			source: 2
		};
		return fetch("https://www.facebook.com/ufi/reaction/", {
			method: "POST",
			credentials: "include",
			body: fbTools.conv.form(f)
		}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
	}
}