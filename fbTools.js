let fbTools = new (function() {
	// Base
    this.conv = {
        query: (obj) => `?${Object.keys(obj).map((key) => `${key}=${obj[key]}`).join("&")}`, // Input: {a: "asdf", b: "sd"} Output: "?a=asdf&b=sd"
		form: function(obj) {
			// Input: {a: "asdf", b: "sd"} Output: FormData
            let f = new FormData();
            for (let key of Object.keys(obj)) f.append(key, obj[key]);
			return f;
		}
	};
    this.fet = function(obj) {
		let {url, bdy} = obj,
			caller = (arguments.callee.caller.name) ? `.${arguments.callee.caller.name}` : "";
		return fetch(url, {method: "POST", credentials: "include", ...bdy}).then((res) => (console.log(`%c fbTools.${this}${caller} `, "background: #2851A3; color: #FFF;", `Response HTTP Code: ${res.status}`), (String(res.status).match(/^2/g)) ? true : false));
	};
    this.get = {
		local: () => ({
			me: require("CurrentUserInitialData").USER_ID || document.cookie.match(/(?<=c_user=)\d+/g).pop(),
			dtsg: require("DTSGInitialData").token || document.querySelector('[name="fb_dtsg"]').value,
			dtsg_ag: require("DTSG_ASYNC").getToken()
		}),
		ids: (url) => fetch(url).then((res) => res.text()).then((res) => ({
			postsId: res.match(/(?<=name="ft_ent_identifier"\svalue=")\d+(?=")/g),
			userId: res.match(/(?<=entity_id":")\d+(?=")/g),
			groupId: res.match(/(?<=membership_group_id:)\d+(?=,)/g),
			pageId: res.match(/(?<=page_id:")\d+(?=")/g)
		}))
	};
	// Actual Functions
    this.cmt = {
		add: async (obj) => {
			// Object Supported: {sticker: 123, post: 123, cmt: "your cmt", reply: 123, url: "https://www.youtube.com/"}
			let f = {
				client_id: "1489983090155:3363757627",
				fb_dtsg: await this.get.local().dtsg,
				session_id: "84d81e4",
				source: 2
			};
			for (let key in obj) {
				if (obj[key]) switch (key) {
					case "sticker": f.attached_sticker_fbid = obj[key]; break;
					case "post": f.ft_ent_identifier = obj[key]; break;
					case "cmt": f.comment_text = obj[key]; break;
					case "reply": f.reply_fbid = obj[key]; f.parent_comment_id = `${obj["post"]}_${obj[key]}`; break;
					case "url": f.attached_share_url = obj[key]; break;
					default: console.log(`Key: ${key} - Value: ${obj[key]} is not supported.`); break;
				};
			};
			return this.fet.call("cmt", {url: "https://www.facebook.com/ufi/add/comment/", bdy: {body: this.conv.form(f)}});
		},
		del: async (postId, cmtId) => this.fet.call("cmt", {
			url: "https://www.facebook.com/ufi/delete/comment/",
			bdy: {
				body: this.conv.form({
					client_id: "1489983090155:3363757627",
					comment_id: `${postId}_${cmtId}`,
					comment_legacyid: cmtId,
					fb_dtsg: await this.get.local().dtsg,
					ft_ent_identifier: postId,
					source: 2
				})
			}
		})
	};
	this.conversation = {
		changeEmoji: async (threadId, icon) => this.fet.call("conversation", {
			url: "https://www.facebook.com/messaging/save_thread_emoji/?source=thread_settings",
			bdy: {
				body: this.conv.form({
					thread_or_other_fbid: threadId,
					emoji_choice: JSON.parse(`"${icon}"`),
					fb_dtsg: await this.get.local().dtsg
				})
			}
		}),
		changeNickname: async (id, nickName, threadId = id) => this.fet.call("conversation", {
			url: "https://www.facebook.com/messaging/save_thread_nickname/?source=thread_settings",
			bdy: {
				body: this.conv.form({
					fb_dtsg: await this.get.local().dtsg,
					nickname: nickName,
					participant_id: id,
					thread_or_other_fbid: threadId
				})
			}
		}),
		chat: async (obj) => {
			// Object Supported: {audio: 123, emoji: "😂", emoji: "\uD83D\uDE02", emoji_size: "Pick one: small medium large", img: 123, message: "your cmt", sticker: 123, thread: 123, user: 123, video: 123, kick: 123 }
			let mId = Math.floor(Math.random() * 999999999),
				f = {
					action_type: "ma-type:user-generated-message",
					client: "mercury",
					ephemeral_ttl_mode: 0,
					fb_dtsg: await this.get.local().dtsg,
					has_attachment: false,
					message_id: mId,
					offline_threading_id: mId,
					source: "source:titan:web",
					timestamp: Date.now()
				};
			for (let key in obj) {
				if (obj[key]) switch(key) {
					case "thread": f.thread_fbid = obj[key]; break;
					case "message": f.body = obj[key]; break;
					case "sticker": f.has_attachment = true; f.sticker_id = obj[key]; break;
					case "user": f.other_user_fbid = obj[key]; break;
					case "kick": f.action_type = "ma-type:log-message"; f.log_message_type = "log:unsubscribe"; f["log_message_data[removed_participants][0]"] = `fbid:${obj[key]}`; break;
					case "img": f.has_attachment = true; (typeof(obj[key]) == "string" || typeof(obj[key]) == "number") ? f["image_ids[0]"] = obj[key] : (typeof(obj[key]) == "object") ? obj[key].forEach((id, item) => f[`image_ids[${item}]`] = id) : ""; break;
					case "audio": f["audio_ids[0]"] = obj[key]; break;
					case "video": f["video_ids[0]"] = obj[key]; break;
					case "emoji": f.body = JSON.parse(`"${obj[key]}"`); break;
					case "emoji_size": f["tags[0]"] = `hot_emoji_size:${obj[key]}`; break;
					default: console.log(`Key: ${key} - Value: ${obj[key]} is not supported.`); break;
				};
			};
			return this.fet.call("conversation", {url: "https://www.facebook.com/messaging/send/", bdy: {body: this.conv.form(f)}});
		},
		del: async (threadId) => this.fet.call("conversation", {
			url: "https://www.facebook.com/ajax/mercury/delete_thread.php",
			bdy: {
				body: this.conv.form({
					"ids[0]": threadId,
					fb_dtsg: await this.get.local().dtsg
				})
			}
		}),
        typing: async (userId, typ) => this.fet.call("conversation", {
        	// typ = 0 or 1
			url: "https://www.facebook.com/ajax/messaging/typ.php",
			bdy: {
				body: this.conv.form({
					fb_dtsg: await this.get.local().dtsg,
					source: "mercury-chat",
					thread: userId,
					to: userId,
					typ: typ
				})
			}
		})
	};
    this.group = {
		addMem: async (groupId, memberId) => this.fet.call("group", {
			url: "https://www.facebook.com/ajax/groups/members/add_post/",
			bdy: {
				body: this.conv.form({
					"members[0]": memberId,
					fb_dtsg: await this.get.local().dtsg,
					group_id: groupId,
					message_id: "groupsAddMemberCompletionMessage",
					source: "suggested_members_new"
				})
			}
		}),
		approveJoin: async (groupId, memberId) => {
			let local = await this.get.local();
			return this.fet.call("group", {
				url: "https://www.facebook.com/api/graphql/",
				bdy: {
					body: this.conv.form({
						av: local.me,
						fb_api_caller_class: "RelayModern",
						fb_api_req_friendly_name: "GroupApprovePendingMemberMutation",
						variables: JSON.stringify({
							"input":{
								"client_mutation_id": "1",
								"actor_id": String(local.me),
								"group_id": String(groupId),
								"user_id": String(memberId),
								"source": "requests_queue",
								"name_search_string": null,
								"pending_member_filters": {
									"filters":[]
								}
							}
						}),
						fb_dtsg: local.dtsg,
						doc_id: 1619292161474296
					})
				}
			})
		},
		create: async (groupName, privacy = "open", discov = "anyone", memIds = "") => {
			// Group Privacy Supported: secret | open (Case Sensitive)
			// Group Discoverability: members_only | anyone
			// memIds: Array of user you want them to be group member
			let f = {
				fb_dtsg: await this.get.local().dtsg,
				ref: "discover_groups",
				"purposes[0]": "",
				name: groupName,
				privacy: privacy,
				discoverability: discov
			};
			if (memIds) memIds.forEach((id, index) => {f[`members[${index}`] = id;});
			return this.fet.call("group", {url: "https://www.facebook.com/ajax/groups/create_post/", bdy: {body: this.conv.form(f)}});
		},
		// role = "invite_admin" || "remove_admin" || "invite_moderator" || "remove_moderator"
		inviteRole: async (groupId, memberId, role) => this.fet.call("group", {
			url: `https://www.facebook.com/ajax/groups/admin_post/${this.conv.query({
				group_id: groupId,
				user_id: memberId,
				source: "profile_browser",
				operation: `confirm_${role}`
			})}`,
			bdy: {
				body: this.conv.form({
					fb_dtsg: await this.get.local().dtsg,
					[role]: 1
				})
			}
		}),
		kick: async (groupId, memberId, block = 0) => this.fet.call("group", {
			url: `https://www.facebook.com/ajax/groups/remove_member/${this.conv.query({
				group_id: groupId,
				is_undo: 0,
				member_id: memberId,
				source: "profile_browser"
			})}`,
			bdy: {
				body: this.conv.form({
					block_user: block,
					confirmed: true,
					fb_dtsg: await this.get.local().dtsg
				})
			}
		}),
		leave: async (groupId, reAdd) => this.fet.call("group", {
			// reAdd = Boolean, Which accept anyone invite you to join group again, default: false = they still can add you to group
			url: `https://www.facebook.com/ajax/groups/membership/leave/?group_id=${groupId}`,
			bdy: {
				body: this.conv.form({
					confirmed: 1,
					fb_dtsg: await this.get.local().dtsg,
					prevent_readd: (reAdd) ? "on" : ""
				})
			}
		}),
		mute: async (groupId, memberId) => this.fet.call("group", {
			url: "https://www.facebook.com/groups/mutemember/",
			bdy: {
				body: this.conv.form({
					fb_dtsg: await this.get.local().dtsg,
					group_id: groupId,
					mute_duration: "seven_days", // "half_day" || "one_day" || "three_days" || "seven_days"
					should_reload: false,
					source: "profile_browser",
					user_id: memberId
				})
			}
		}),
		notification: async (groupId, level) => this.fet.call("group", {
			// Subscription Level: 6 - Highlight | 3 - All | 2 - Friends | 1 - Off
			url: `https://www.facebook.com/groups/notification/settings/edit/?group_id=${groupId}&subscription_level=${level}`,
			bdy: {
				body: this.conv.form({
					fb_dtsg: await this.get.local().dtsg
				})
			}
		}),
		post: {
			approve: async (groupId, postId) => this.fet.call("group.post", {
				url: "https://www.facebook.com/ajax/groups/mall/approve/",
				bdy: {
					body: this.conv.form({
						group_id: groupId,
						message_ids: postId,
						"nctr[_mod]": "pagelet_pending_queue",
						fb_dtsg: await this.get.local().dtsg
					})
				}
			}),
            del: async (groupId, postId) => this.fet.call("group.post", {
				url: "https://www.facebook.com/ajax/groups/mall/delete/",
				bdy: {
					body: this.conv.form({
						confirmed: 1,
						fb_dtsg: await this.get.local().dtsg,
						group_id: groupId,
						post_id: postId
					})
				}
			}),
			disableCmt: async (postId, cmt) => this.fet.call("group.post", {
				// cmt = 1 -> disable | 0 -> enable
				url: "https://www.facebook.com/feed/ufi/disable_comments/",
				bdy: {
					body: this.conv.form({
						fb_dtsg: await this.get.local().dtsg,
						ft_ent_identifier: postId,
						disable_comments: cmt
					})
				}
			}),
			offNotification: async (groupId, postId, follow) => this.fet.call("group.post", {
				// follow = 0 -> Turn Off notification | 1 -> turn on notification
				url: "https://www.facebook.com/ajax/litestand/follow_group_post",
				bdy: {
					body: this.conv.form({
						fb_dtsg: await this.get.local().dtsg,
						group_id: groupId,
						message_id: postId,
						follow: follow
					})
				}
			}),
			preapproveMem: async (groupId, memberId, approve = 1) => this.fet.call("group.post", {
				url: `https://www.facebook.com/ajax/groups/${(approve) ? "" : "un"}trust_member/${this.conv.query({
					group_id: groupId,
					member_id: memberId,
					should_reload: 1,
					source: "member_list",
				})}`,
				bdy: {
					body: this.conv.form({
						group_id: groupId,
						member_id: memberId,
						should_reload: 1,
						source: "member_list",
						"nctr[_mod]": "pagelet_group_members",
						confirmed: 1,
						fb_dtsg: await this.get.local().dtsg
					})
				}
			}),
		},
		topics: {
			add: async (groupId, topic) => fbTools.fet.call("group.topics", {
				url: `https://www.facebook.com/groups/post_tag/add/dialog/`,
				bdy: {
					body: fbTools.conv.form({
						group_id: groupId,
						tag_name: topic,
						dom_id: `${groupId}_group_tab_post_tags`,
						fb_dtsg: await fbTools.get.local().dtsg
					})
				}
			}),
			del: async (groupId, topicId) => fbTools.fet.call("group.topics", {
				url: "https://www.facebook.com/groups/post_tag/manage_tag/delete_tag/confirmed/",
				bdy: {
					body: fbTools.conv.form({
						group_id: groupId,
						post_tag_id: topicId,
						order: "ranked",
						query_term: "",
						search_one_item: 0,
						dom_id: `${groupId}_group_tab_post_tags`,
						"nctr[_mod]": "pagelet_group_admin_activities",
						confirmed: 1,
						fb_dtsg: await fbTools.get.local().dtsg
					})
				}
			}),
			edit: async (groupId, topicId, topic) => fbTools.fet.call("group.topics", {
				url: `https://www.facebook.com/groups/post_tag/manage_tag/edit_save/`,
				bdy: {
					body: fbTools.conv.form({
						group_id: groupId,
						tag_name: topic,
						post_tag_id: topicId,
						order: "ranked",
						query_term: "",
						one_item: false,
						dom_id: `${groupId}_group_tab_post_tags`,
						fb_dtsg: await fbTools.get.local().dtsg
					})
				}
			})
		},
		unban: async (groupId, memberId) => this.fet.call("group", {
			url: `https://www.facebook.com/ajax/groups/admin_post/${this.conv.query({
				group_id: groupId,
				operation: "confirm_remove_block",
				source: "profilebrowser_blocked",
				user_id: memberId
			})}`,
			bdy: {
				body: this.conv.form({
					fb_dtsg: await this.get.local().dtsg,
					remove_block: 1
				})
			}
		}),
		unfollow: async (groupId, follow) => this.fet.call("group", {
			// follow = 1 -> Unfollow | 0 -> Follow
			url: "https://www.facebook.com/groups/membership/unfollow_group/",
			bdy: {
				body: this.conv.form({
					group_id: groupId,
					unfollow: follow,
					fb_dtsg: await this.get.local().dtsg
				})
			}
		})
    };
    this.friendRequest = async (userId, act) => fbTools.fet.call("friendRequest", {
		// act = true => accept request | false => reject
		url: "https://www.facebook.com/requests/friends/ajax/",
		bdy: {
			body: fbTools.conv.form({
				action: (act) ? "confirm" : "reject",
				fb_dtsg: await fbTools.get.local().dtsg,
				id: userId
			})
		}
    });
    this.me = {
		block: {
			page: async (pageId) => this.fet.call("me.block", {
				url: "https://www.facebook.com/privacy/block_page/",
				bdy: {
					body: this.conv.form({
						confirmed: 1,
						fb_dtsg: await this.get.local().dtsg,
						page_id: pageId
					})
				}
			}),
			user: async (id) => this.fet.call("me.block", {
				url: "https://www.facebook.com/ajax/privacy/block_user.php",
				bdy: {
					body: this.conv.form({
						confirmed: 1,
						fb_dtsg: await this.get.local().dtsg,
						uid: id
					})
				}
			})
		},
		poke: async (userId) => this.fet.call("me", {
			url: `https://www.facebook.com/pokes/dialog/${this.conv.query({
				poke_target: userId
			})}`,
			bdy: {
				body: this.conv.form({
					fb_dtsg: await this.get.local().dtsg
				})
			}
		}),
		post: {
			del: async (postId) => this.fet.call("me.post", {
				url: `https://www.facebook.com/ajax/timeline/delete${this.conv.query({
					identifier: `S:_I${this.get.local().me}:${postId}`,
					is_notification_preview: 0,
					location: 9,
					render_location: 10
				})}`,
				bdy: {
					body: this.conv.form({
						fb_dtsg: this.get.local().dtsg
					})
				}
			}),
			offNotification: async (postId, follow) => this.fet.call("me.post", {
			// follow = 0 -> Turn Off notification | 1 -> turn on notification
				url: "https://www.facebook.com/ajax/litestand/follow_post",
				bdy: {
					body: this.conv.form({
						fb_dtsg: await this.get.local().dtsg,
						message_id: postId,
						follow: follow
					})
				}
			})
		},
		unblock: async (userId) => this.fet.call("me", {
			url: "https://www.facebook.com/privacy/unblock_user/",
			bdy: {
				body: this.conv.form({
					fb_dtsg: await this.get.local().dtsg,
					privacy_source: "privacy_settings_page",
					uid: userId
				})
			}
		}),
		unfollow: async (id) => this.fet.call("me", {
			url: "https://www.facebook.com/ajax/follow/unfollow_profile.php",
			bdy: {
				body: this.conv.form({
					"nctr[_mod]": "pagelet_collections_following",
					fb_dtsg: await this.get.local().dtsg,
					location: 4,
					profile_id: id
				})
			}
		}),
		unfriend: async (userId) => this.fet.call("me", {
			url: "https://www.facebook.com/ajax/profile/removefriendconfirm.php",
			bdy: {
				body: this.conv.form({
					confirmed: 1,
					fb_dtsg: await this.get.local().dtsg,
					uid: userId
				})
			}
		})
    };
    this.page = {
		inviteLike: async (pageId, arrInvite, inviteMessage) => {
			let f = {
				fb_dtsg: await this.get.local().dtsg,
				invite_note: inviteMessage,
				page_id: pageId,
				ref: "modal_page_invite_dialog_v2",
				send_in_messenger: false
			};
			arrInvite.forEach((id, index) => {f[`invitees[${index}]`] = id;});
			return this.fet.call("page", {url: "https://www.facebook.com/pages/batch_invite_send/", bdy: {body: this.conv.form(f)}});
		},
		like: async (pageId, orNot) => this.fet.call("page", {
			// orNot = true => like page | false => Unlike
			url: `https://www.facebook.com/ajax/pages/fan_status.php?av=${this.get.myId()}`,
			bdy: {
				body: this.conv.form({
					actor_id: this.get.myId(),
					add: orNot,
					fb_dtsg: this.get.local().dtsg,
					fbpage_id: pageId,
					reload: false
				})
			}
		})
    };

	// Reaction {none: 0, like: 1, love: 2, wow: 3, haha: 4, sad: 7, angry: 8}
    this.reaction = async (postId, reactType) => this.fet.call("reaction", {
		url: "https://www.facebook.com/ufi/reaction/",
		bdy: {
			body: this.conv.form({
				client_id: "1489983090155:3363757627",
				fb_dtsg: await this.get.local().dtsg,
				ft_ent_identifier: postId,
				reaction_type: reactType,
				session_id: "84d81e4",
				source: 2
			})
		}
    });
});
console.log(fbTools);
