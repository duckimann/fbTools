let fbTools = new (function() {
	// Base
    this.conv = {
        query: (obj) => `?${Object.keys(obj).map((key) => `${key}=${obj[key]}`).join("&")}`,
		form: function(obj) {
            let f = new FormData();
            for (let key in obj) f.append(key, obj[key]);
			return f;
		}
	};
    this.fet = async function({url, bdy = { body: new FormData() }}) {
		bdy.body.append("fb_dtsg", await this.get.local().dtsg);
		return fetch(url, {method: "POST", credentials: "include", ...bdy}).then((res) => (String(res.status).match(/^2/g)) ? true : false);
	};
    this.get = {
		local: () => ({
			me: require("CurrentUserInitialData").USER_ID || document.cookie.match(/(?<=c_user=)\d+/g).pop(),
			dtsg: require("DTSGInitialData").token || document.querySelector('[name="fb_dtsg"]').value,
			dtsg_ag: require("DTSG_ASYNC").getToken(),
			tlController: require("TimelineController"),
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
		add: (obj) => {
			// Object Supported: {sticker: 123, post: 123, cmt: "your cmt", reply: 123, url: "https://www.youtube.com/"}
			let f = {
				client_id: "1489983090155:3363757627",
				session_id: "84d81e4",
				source: 2,

				...(obj.sticker) ? ({attached_sticker_fbid: obj.sticker}) : "",
				...(obj.post) ? ({ft_ent_identifier: obj.post}) : "",
				...(obj.cmt) ? ({comment_text: obj.cmt}) : "",
				...(obj.reply) ? ({
					reply_fbid: obj.reply,
					parent_comment_id: `${obj.post}_${obj.reply}`
				}) : "",
				...(obj.url) ? ({attached_share_url: obj.url}) : "",
			};
			return this.fet({url: "https://www.facebook.com/ufi/add/comment/", bdy: {body: this.conv.form(f)}});
		},
		del: (postId, cmtId) => this.fet({
			url: "https://www.facebook.com/ufi/delete/comment/",
			bdy: {
				body: this.conv.form({
					client_id: "1489983090155:3363757627",
					comment_id: `${postId}_${cmtId}`,
					comment_legacyid: cmtId,
					ft_ent_identifier: postId,
					source: 2
				})
			}
		})
	};
	this.conversation = {
		changeEmoji: (threadId, icon) => this.fet.call("conversation", {
			url: "https://www.facebook.com/messaging/save_thread_emoji/?source=thread_settings",
			bdy: {
				body: this.conv.form({
					thread_or_other_fbid: threadId,
					emoji_choice: JSON.parse(`"${icon}"`),
				})
			}
		}),
		changeNickname: (id, nickName, threadId = id) => this.fet({
			url: "https://www.facebook.com/messaging/save_thread_nickname/?source=thread_settings",
			bdy: {
				body: this.conv.form({
					nickname: nickName,
					participant_id: id,
					thread_or_other_fbid: threadId
				})
			}
		}),
		chat: (obj) => {
			/* Object Supported: {
					audio: 123,
					emoji: "😂" || "\uD83D\uDE02",
					emoji_size: "small" || "medium" || "large",
					img: 123, // or img: [1,2,3]
					message: "your msg",
					sticker: 123,
					thread: 123,
					user: 123,
					video: 123,
				}
			*/
			let mId = Math.floor(Math.random() * 999999999),
				f = {
					action_type: "ma-type:user-generated-message",
					client: "mercury",
					ephemeral_ttl_mode: 0,
					has_attachment: false,
					message_id: mId,
					offline_threading_id: mId,
					source: "source:titan:web",
					timestamp: Date.now(),

					...(obj.audio) ? ({"audio_ids[0]": obj.audio}) : "",
					...(obj.emoji) ? ({body: JSON.parse(`"${obj.emoji}"`)}) : "",
					...(obj.emoji_size) ? ({"tags[0]": `hot_emoji_size:${obj.emoji_size}`}) : "",
					// ...(obj.file) ? ({
					// 	has_attachment: true,
					// 	"file_ids[0]": obj.file
					// }) : "",
					...(obj.img) ? ({
						has_attachment: true,
						...(Array.isArray(obj.img) ? obj.img : [obj.img]).reduce((current, item, index) => ({...current, [`image_ids[${index}]`]: item}), {})
					}) : "",
					...(obj.message) ? ({body: obj.message}) : "",
					...(obj.sticker) ? ({
						has_attachment: true,
						sticker_id: obj.sticker
					}) : "",
					...(obj.thread) ? ({thread_fbid: obj.thread}) : "",
					...(obj.user) ? ({other_user_fbid: obj.user}) : "",
					...(obj.video) ? ({"video_ids[0]": obj.video}) : "",
				};
			return this.fet({url: "https://www.facebook.com/messaging/send/", bdy: { body: this.conv.form(f) }});
		},
		kick: (threadId, userId) => this.fet({ url: `https://www.facebook.com/chat/remove_participants/?uid=${userId}&tid=${threadId}`, }),
		del: (threadId) => this.fet({
			url: "https://www.facebook.com/ajax/mercury/delete_thread.php",
			bdy: {
				body: this.conv.form({
					"ids[0]": threadId
				})
			}
		}),
        typing: (userId, typ) => this.fet({
        	// typ = 0 || 1
			url: "https://www.facebook.com/ajax/messaging/typ.php",
			bdy: {
				body: this.conv.form({
					source: "mercury-chat",
					thread: userId,
					to: userId,
					typ: typ
				})
			}
		})
	};
    this.group = {
		addMem: (groupId, memberId) => this.fet({
			url: "https://www.facebook.com/ajax/groups/members/add_post/",
			bdy: {
				body: this.conv.form({
					"members[0]": memberId,
					group_id: groupId,
					message_id: "groupsAddMemberCompletionMessage",
					source: "suggested_members_new"
				})
			}
		}),
		approveJoin: async (groupId, memberId) => {
			let local = await this.get.local();
			return this.fet({
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
						doc_id: 1619292161474296
					})
				}
			})
		},
		create: (groupName, privacy = "open", discov = "anyone", memIds = "") => {
			// memIds: Array of user you want them to be group member
			let f = {
				ref: "discover_groups",
				"purposes[0]": "",
				name: groupName,
				privacy: privacy, // "secret" || "open"
				discoverability: discov, // "members_only" || "anyone"
				...(Array.isArray(memIds) ? memIds : [memIds]).reduce((current, item, index) => ({...current, [`members[${index}`]: item}), {})
			};
			return this.fet({url: "https://www.facebook.com/ajax/groups/create_post/", bdy: { body: this.conv.form(f) }});
		},
		// role = "invite_admin" || "remove_admin" || "invite_moderator" || "remove_moderator"
		inviteRole: (groupId, memberId, role) => this.fet({
			url: `https://www.facebook.com/ajax/groups/admin_post/${this.conv.query({
				group_id: groupId,
				user_id: memberId,
				source: "profile_browser",
				operation: `confirm_${role}`
			})}`,
			bdy: {
				body: this.conv.form({
					[role]: 1
				})
			}
		}),
		kick: (groupId, memberId, block = 0) => this.fet({
			url: `https://www.facebook.com/ajax/groups/remove_member/${this.conv.query({
				group_id: groupId,
				is_undo: 0,
				member_id: memberId,
				source: "profile_browser"
			})}`,
			bdy: {
				body: this.conv.form({
					block_user: block,
					confirmed: true
				})
			}
		}),
		leave: (groupId, reAdd) => this.fet({
			// reAdd = Boolean, Which accept anyone invite you to join group again, default: false = they still can add you to group
			url: `https://www.facebook.com/ajax/groups/membership/leave/?group_id=${groupId}`,
			bdy: {
				body: this.conv.form({
					confirmed: 1,
					prevent_readd: (reAdd) ? "on" : ""
				})
			}
		}),
		mute: (groupId, memberId) => this.fet({
			url: "https://www.facebook.com/groups/mutemember/",
			bdy: {
				body: this.conv.form({
					group_id: groupId,
					mute_duration: "seven_days", // "half_day" || "one_day" || "three_days" || "seven_days"
					should_reload: false,
					source: "profile_browser",
					user_id: memberId
				})
			}
		}),
		notification: (groupId, level) => this.fet({
			// Subscription Level: 6 - Highlight | 3 - All | 2 - Friends | 1 - Off
			url: `https://www.facebook.com/groups/notification/settings/edit/?group_id=${groupId}&subscription_level=${level}`,
		}),
		post: {
			approve: (groupId, postId) => this.fet({
				url: "https://www.facebook.com/ajax/groups/mall/approve/",
				bdy: {
					body: this.conv.form({
						group_id: groupId,
						message_ids: postId,
						"nctr[_mod]": "pagelet_pending_queue"
					})
				}
			}),
            del: (groupId, postId) => this.fet({
				url: "https://www.facebook.com/ajax/groups/mall/delete/",
				bdy: {
					body: this.conv.form({
						confirmed: 1,
						group_id: groupId,
						post_id: postId
					})
				}
			}),
			disableCmt: (postId, cmt) => this.fet({
				// cmt = 1 -> disable | 0 -> enable
				url: "https://www.facebook.com/feed/ufi/disable_comments/",
				bdy: {
					body: this.conv.form({
						ft_ent_identifier: postId,
						disable_comments: cmt
					})
				}
			}),
			offNotification: (groupId, postId, follow) => this.fet({
				// follow = 0 -> Turn Off notification | 1 -> turn on notification
				url: "https://www.facebook.com/ajax/litestand/follow_group_post",
				bdy: {
					body: this.conv.form({
						group_id: groupId,
						message_id: postId,
						follow: follow
					})
				}
			}),
			preapproveMem: (groupId, memberId, approve = 1) => this.fet({
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
						confirmed: 1
					})
				}
			}),
		},
		topics: {
			add: (groupId, topic) => fbTools.fet({
				url: `https://www.facebook.com/groups/post_tag/add/dialog/`,
				bdy: {
					body: fbTools.conv.form({
						group_id: groupId,
						tag_name: topic,
						dom_id: `${groupId}_group_tab_post_tags`
					})
				}
			}),
			del: (groupId, topicId) => fbTools.fet({
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
						confirmed: 1
					})
				}
			}),
			edit: (groupId, topicId, topic) => fbTools.fet({
				url: `https://www.facebook.com/groups/post_tag/manage_tag/edit_save/`,
				bdy: {
					body: fbTools.conv.form({
						group_id: groupId,
						tag_name: topic,
						post_tag_id: topicId,
						order: "ranked",
						query_term: "",
						one_item: false,
						dom_id: `${groupId}_group_tab_post_tags`
					})
				}
			})
		},
		unban: (groupId, memberId) => this.fet({
			url: `https://www.facebook.com/ajax/groups/admin_post/${this.conv.query({
				group_id: groupId,
				operation: "confirm_remove_block",
				source: "profilebrowser_blocked",
				user_id: memberId
			})}`,
			bdy: {
				body: this.conv.form({
					remove_block: 1
				})
			}
		}),
		unfollow: (groupId, follow) => this.fet({
			// follow = 1 -> Unfollow | 0 -> Follow
			url: "https://www.facebook.com/groups/membership/unfollow_group/",
			bdy: {
				body: this.conv.form({
					group_id: groupId,
					unfollow: follow
				})
			}
		})
    };
    this.friendRequest = (userId, act) => fbTools.fet({
		// act = true => accept request | false => reject
		url: "https://www.facebook.com/requests/friends/ajax/",
		bdy: {
			body: fbTools.conv.form({
				action: (act) ? "confirm" : "reject",
				id: userId
			})
		}
    });
    this.me = {
		block: {
			page: (pageId) => this.fet({
				url: "https://www.facebook.com/privacy/block_page/",
				bdy: {
					body: this.conv.form({
						confirmed: 1,
						page_id: pageId
					})
				}
			}),
			user: (id) => this.fet({
				url: "https://www.facebook.com/ajax/privacy/block_user.php",
				bdy: {
					body: this.conv.form({
						confirmed: 1,
						uid: id
					})
				}
			})
		},
		poke: (userId) => this.fet({ url: `https://www.facebook.com/pokes/dialog/${this.conv.query({ poke_target: userId })}`, }),
		post: {
			del: (postId) => this.fet({
				url: `https://www.facebook.com/ajax/timeline/delete${this.conv.query({
					identifier: `S:_I${this.get.local().me}:${postId}`,
					is_notification_preview: 0,
					location: 9,
					render_location: 10
				})}`,
			}),
			offNotification: (postId, follow) => this.fet({
			// follow = 0 -> Turn Off notification | 1 -> turn on notification
				url: "https://www.facebook.com/ajax/litestand/follow_post",
				bdy: {
					body: this.conv.form({
						message_id: postId,
						follow: follow
					})
				}
			})
		},
		unblock: (userId) => this.fet({
			url: "https://www.facebook.com/privacy/unblock_user/",
			bdy: {
				body: this.conv.form({
					privacy_source: "privacy_settings_page",
					uid: userId
				})
			}
		}),
		unfollow: (id) => this.fet({
			url: "https://www.facebook.com/ajax/follow/unfollow_profile.php",
			bdy: {
				body: this.conv.form({
					"nctr[_mod]": "pagelet_collections_following",
					location: 4,
					profile_id: id
				})
			}
		}),
		unfriend: (userId) => this.fet({
			url: "https://www.facebook.com/ajax/profile/removefriendconfirm.php",
			bdy: {
				body: this.conv.form({
					confirmed: 1,
					uid: userId
				})
			}
		})
    };
    this.page = {
		inviteLike: (pageId, invitees, inviteMessage) => {
			let f = {
				invite_note: inviteMessage,
				page_id: pageId,
				ref: "modal_page_invite_dialog_v2",
				send_in_messenger: false,
				...(Array.isArray(invitees) ? invitees : [invitees]).reduce((current, item, index) => ({...current, [`invitees[${index}]`]: item}), {})
			};
			return this.fet({url: "https://www.facebook.com/pages/batch_invite_send/", bdy: {body: this.conv.form(f)}});
		},
		like: (pageId, orNot) => (myId = this.get.myId(), this.fet({
			// orNot = true => like page | false => Unlike
			url: `https://www.facebook.com/ajax/pages/fan_status.php?av=${myId}`,
			bdy: {
				body: this.conv.form({
					actor_id: myId,
					add: orNot,
					fbpage_id: pageId,
					reload: false
				})
			}
		}))
    };

	// Reaction {none: 0, like: 1, love: 2, wow: 3, haha: 4, sad: 7, angry: 8, care: 16}
    this.reaction = (postId, reactType) => this.fet({
		url: "https://www.facebook.com/ufi/reaction/",
		bdy: {
			body: this.conv.form({
				client_id: "1489983090155:3363757627",
				ft_ent_identifier: postId,
				reaction_type: reactType,
				session_id: "84d81e4",
				source: 2
			})
		}
    });
    this.upload = async (blob) => {
		let f = await {
				"attachment[]": blob,
				fb_dtsg: this.get.local().dtsg
			};

		if (blob.type.includes("image")) f.image_only = true;
		if (blob.type.includes("audio")) f.voice_clip = true;
		if (blob.type.includes("text")) f.file_only = true; // I'm just predicting this is it. Idk is it true btw =.=

		return fetch(`https://upload.facebook.com/ajax/mercury/upload.php?fb_dtsg=${f.fb_dtsg}&__a=1`, {
			method: "POST",
			credentials: "include",
			body: this.conv.form(f)
		}).then((e) => e.text());
	};
});
console.log(fbTools);