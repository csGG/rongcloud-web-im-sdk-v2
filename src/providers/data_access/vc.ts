module RongIMLib {
    export class VCDataProvider implements DataAccessProvider {

        addon: Addon;

        messageListener: OnReceiveMessageListener;

        connectListener: ConnectionStatusListener;

        userId: string = "";

        connectCallback: ConnectCallback;

        useConsole: boolean = false;

        constructor(addon: any) {
            this.addon = addon;
        }

        init(appKey: string): void {
            this.useConsole && console.log("init");
            this.addon.initWithAppkey(appKey);
              // 0 不存不计数  1 只存不计数 3 存且计数
            this.addon.registerMessageType("RC:VcMsg", 3);
            this.addon.registerMessageType("RC:ImgTextMsg", 3);
            this.addon.registerMessageType("RC:FileMsg", 3);
            this.addon.registerMessageType("RC:LBSMsg", 3);
            this.addon.registerMessageType("RC:PSImgTxtMsg", 3);
            this.addon.registerMessageType("RC:PSMultiImgTxtMsg", 3);
            this.addon.registerMessageType("RCJrmf:RpMsg", 3);
            this.addon.registerMessageType("RCJrmf:RpOpendMsg", 1);
            this.addon.registerMessageType("RC:GrpNtf", 1);
            this.addon.registerMessageType("RC:DizNtf", 0);

            this.addon.registerMessageType("RC:InfoNtf", 0);
            this.addon.registerMessageType("RC:ContactNtf", 0);
            this.addon.registerMessageType("RC:ProfileNtf", 0);
            this.addon.registerMessageType("RC:CmdNtf", 0);
            this.addon.registerMessageType("RC:CmdMsg", 0);
            this.addon.registerMessageType("RC:TypSts", 0);
            this.addon.registerMessageType("RC:CsChaR", 0);
            this.addon.registerMessageType("RC:CsHsR", 0);
            this.addon.registerMessageType("RC:CsEnd", 0);
            this.addon.registerMessageType("RC:CsSp", 0);
            this.addon.registerMessageType("RC:CsUpdate", 0);
            this.addon.registerMessageType("RC:CsContact", 0);
            this.addon.registerMessageType("RC:ReadNtf", 0);
            this.addon.registerMessageType("RC:VCAccept", 0);
            this.addon.registerMessageType("RC:VCRinging", 0);
            this.addon.registerMessageType("RC:VCSummary", 0);
            this.addon.registerMessageType("RC:VCHangup", 0);
            this.addon.registerMessageType("RC:VCInvite", 0);
            this.addon.registerMessageType("RC:VCModifyMedia", 0);
            this.addon.registerMessageType("RC:VCModifyMem", 0);
            this.addon.registerMessageType("RC:PSCmd", 0);
            this.addon.registerMessageType("RC:RcCmd", 0);
            this.addon.registerMessageType("RC:SRSMsg", 0);
            this.addon.registerMessageType("RC:RRReqMsg", 0);
            this.addon.registerMessageType("RC:RRRspMsg", 0);
        }

        connect(token: string, callback: ConnectCallback, userId?: string): void {
            this.useConsole && console.log("connect");
            this.userId = userId;
            this.connectCallback = callback;
            RongIMLib.Bridge._client = <Client>{
                userId: userId
            };
            this.addon.connectWithToken(token, userId);
        }

        setServerInfo(info:any):void {
            'setServerInfo' in this.addon && this.addon.setServerInfo(info.navi);
        }

        logout(): void {
            this.useConsole && console.log("logout");
            this.disconnect();
        }

        disconnect(): void {
            this.useConsole && console.log("disconnect");
            this.addon.disconnect(true);
        }

        clearListeners(): void{
            this.addon.setOnReceiveStatusListener();
            this.addon.setConnectionStatusListener();
            this.addon.setOnReceiveMessageListener();
        }

        setConnectionStatusListener(listener: ConnectionStatusListener): void {
            var me = this;
            /**
            ConnectionStatus_TokenIncorrect = 31004,
            ConnectionStatus_Connected = 0,
            ConnectionStatus_KickedOff = 6,	// 其他设备登录
            ConnectionStatus_Connecting = 10,// 连接中
            ConnectionStatus_SignUp = 12, // 未登录
            ConnectionStatus_NetworkUnavailable = 1, // 连接断开
            ConnectionStatus_ServerInvalid = 8, // 断开
            ConnectionStatus_ValidateFailure = 9,//断开
            ConnectionStatus_Unconnected = 11,//断开
            ConnectionStatus_DisconnExecption = 31011 //断开
            RC_NAVI_MALLOC_ERROR   = 30000,//断开
            RC_NAVI_NET_UNAVAILABLE= 30002,//断开
            RC_NAVI_SEND_FAIL      = 30004,//断开
            RC_NAVI_REQ_TIMEOUT    = 30005,//断开
            RC_NAVI_RECV_FAIL      = 30006,//断开
            RC_NAVI_RESOURCE_ERROR = 30007,//断开
            RC_NAVI_NODE_NOT_FOUND = 30008,//断开
            RC_NAVI_DNS_ERROR      = 30009,//断开
            */

            me.connectListener = listener;
            this.useConsole && console.log("setConnectionStatusListener");
            me.addon && me.addon.setConnectionStatusListener(function(result: number): void {
                switch (result) {
                    case 10:
                        listener.onChanged(ConnectionStatus.CONNECTING);
                        break;
                    case 31004:
                        me.connectCallback.onTokenIncorrect();
                        break;
                    case 1:
                    case 8:
                    case 9:
                    case 11:
                    case 12:
                    case 31011:
                    case 30000:
                    case 30002:
                    case 30004:
                    case 30005:
                    case 30006:
                    case 30007:
                    case 30008:
                    case 30009:
                        listener.onChanged(ConnectionStatus.DISCONNECTED);
                        break;
                    case 0:
                    case 33005:
                        me.connectCallback.onSuccess(me.userId);
                        listener.onChanged(ConnectionStatus.CONNECTED);
                        break;
                    case 6:
                        listener.onChanged(ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT);
                        break;
                }
            });
        }

        setOnReceiveMessageListener(listener: OnReceiveMessageListener): void {
            var me = this,localCount = 0;
            me.messageListener = listener;
            this.useConsole && console.log("setOnReceiveMessageListener");
            me.addon && me.addon.setOnReceiveMessageListener(function(result: string, leftCount: number): void {
                var message:Message = me.buildMessage(result);
                if((leftCount == 0 && localCount == 1) || leftCount > 0) {
                    message.offLineMessage = true;
                }else{    
                    message.offLineMessage = false;
                }
                localCount = leftCount;
                listener.onReceived(message, leftCount);
            });
        }



        sendTypingStatusMessage(conversationType: ConversationType, targetId: string, messageName: string, sendCallback: SendMessageCallback): void {
            var me = this;
            this.useConsole && console.log("sendTypingStatusMessage");
            if (messageName in RongIMClient.MessageParams) {
                me.sendMessage(conversationType, targetId, TypingStatusMessage.obtain(RongIMClient.MessageParams[messageName].objectName, ""), {
                    onSuccess: function() {
                        setTimeout(function() {
                            sendCallback.onSuccess();
                        });
                    },
                    onError: function(errorCode: ErrorCode) {
                        setTimeout(function() {
                            sendCallback.onError(errorCode, null);
                        });
                    },
                    onBefore: function(){}
                });
            }
        }

        setMessageStatus(conversationType: ConversationType, targetId: string, timestamp:number, status: string, callback:ResultCallback<Boolean>):void{
            this.addon.updateMessageReceiptStatus(conversationType, targetId, timestamp);
            callback.onSuccess(true);
        }

        sendTextMessage(conversationType: ConversationType, targetId: string, content: string, sendMessageCallback: SendMessageCallback): void {
            var msgContent = TextMessage.obtain(content);
            this.useConsole && console.log("sendTextMessage");
            this.sendMessage(conversationType, targetId, msgContent, sendMessageCallback);
        }

        getRemoteHistoryMessages(conversationType: ConversationType, targetId: string, timestamp: number, count: number, callback: GetHistoryMessagesCallback): void {
            try {
                var me = this;
                me.useConsole && console.log("getRemoteHistoryMessages");
                me.addon.getRemoteHistoryMessages(conversationType, targetId, timestamp ? timestamp : 0, count, function(ret: string, hasMore: number) {
                    var list: any[] = ret ? JSON.parse(ret).list : [], msgs: Message[] = [];
                    list.reverse();
                    for (var i = 0, len = list.length; i < len; i++) {
                        var message = me.buildMessage(list[i].obj);
                        message.sentStatus = RongIMLib.SentStatus.READ;
                        msgs[i] = message;
                    }
                    callback.onSuccess(msgs, hasMore ? true : false);
                }, function(errorCode: ErrorCode) {
                    callback.onError(errorCode);
                });
            } catch (e) {
                callback.onError(e);
            }
        }

        getRemoteConversationList(callback: ResultCallback<Conversation[]>, conversationTypes: ConversationType[], count: number,isGetHiddenConvers:boolean): void {
            try {
                this.useConsole && console.log("getRemoteConversationList");
                var converTypes: number[] = conversationTypes || [1, 2, 3, 4, 5, 6, 7, 8];
                var result: string = this.addon.getConversationList(converTypes);
                var list: any[] = JSON.parse(result).list, convers: Conversation[] = [], me = this,index:number = 0;
                list.reverse();
                isGetHiddenConvers = typeof isGetHiddenConvers === 'boolean' ? isGetHiddenConvers : false;
                for (let i = 0, len = list.length; i < len; i++) {
                    var tmpObj = list[i].obj,obj:any = JSON.parse(tmpObj);
                    if(obj.isHidden == 1 && isGetHiddenConvers) {
                        continue;
                    }
                    convers[index] = me.buildConversation(tmpObj);
                    index++;
                }
                convers.reverse(); 
                callback.onSuccess(convers);
            } catch (e) {
                callback.onError(e);
            }
        }

        removeConversation(conversationType: ConversationType, targetId: string, callback: ResultCallback<boolean>): void {
            try {
                this.useConsole && console.log("removeConversation");
                this.addon.removeConversation(conversationType, targetId);
                var conversations = RongIMClient._memoryStore.conversationList
                var len = conversations.length;
                for(var i=0; i<len; i++){
                    if(conversations[i].conversationType == conversationType && targetId == conversations[i].targetId) {
                        conversations.splice(i,1);
                        break;
                    }
                }
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }

        joinChatRoom(chatRoomId: string, messageCount: number, callback: OperationCallback): void {
            this.useConsole && console.log("joinChatRoom");
            this.addon.joinChatRoom(chatRoomId, messageCount,
                function() {
                    callback.onSuccess();
                },
                function(error: ErrorCode) {
                    callback.onError(error);
                });
        }

        quitChatRoom(chatRoomId: string, callback: OperationCallback): void {
            this.useConsole && console.log("quitChatRoom");
            this.addon.quitChatRoom(chatRoomId,
                function() {
                    callback.onSuccess();
                },
                function(error: ErrorCode) {
                    callback.onError(error);
                });
        }

        addToBlacklist(userId: string, callback: OperationCallback): void {
            this.useConsole && console.log("addToBlacklist");
            this.addon.addToBlacklist(userId,
                function() {
                    callback.onSuccess();
                },
                function(error: ErrorCode) {
                    callback.onError(error);
                });

        }

        getBlacklist(callback: GetBlacklistCallback): void {
            this.useConsole && console.log("getBlacklist");
            this.addon.getBlacklist(
                function(blacklistors: string[]) {
                    callback.onSuccess(blacklistors);
                },
                function(error: ErrorCode) {
                    callback.onError(error);
                });
        }

        getBlacklistStatus(userId: string, callback: ResultCallback<string>): void {
            this.useConsole && console.log("getBlacklistStatus");
            this.addon.getBlacklistStatus(userId,
                function(result: string) {
                    callback.onSuccess(result);
                },
                function(error: ErrorCode) {
                    callback.onError(error);
                });
        }
 
        removeFromBlacklist(userId: string, callback: OperationCallback): void {
            this.useConsole && console.log("removeFromBlacklist");
            this.addon.removeFromBlacklist(userId,
                function() {
                    callback.onSuccess();
                },
                function(error: ErrorCode) {
                    callback.onError(error);
                });
        }


        sendMessage(conversationType: ConversationType, targetId: string, messageContent: MessageContent, sendCallback: SendMessageCallback, mentiondMsg?: boolean, pushText?: string, appData?: string, methodType?: number, params?:any): void {
            var me = this , users:string[] = [];
            me.useConsole && console.log("sendMessage");

            params = params || {};

            var isGroup = (conversationType == ConversationType.DISCUSSION || conversationType == ConversationType.GROUP);

             if ( isGroup && messageContent.messageName == RongIMClient.MessageType["ReadReceiptResponseMessage"]) {
                users = [];
                var rspMsg: ReadReceiptResponseMessage = <ReadReceiptResponseMessage>messageContent;
                if (rspMsg.receiptMessageDic) {
                    var ids: string[] = [];
                    for (var key in rspMsg.receiptMessageDic) {
                        ids.push(key);
                    }
                    users = ids;
                }
            }

             if (isGroup && messageContent.messageName == RongIMClient.MessageType["SyncReadStatusMessage"]) {
                users = [];
                users.push(me.userId);
            }

            var userIds = params.userIds;
            if (isGroup && userIds) {
                users = userIds;    
            }
            var msg: string = me.addon.sendMessage(conversationType,
                targetId, RongIMClient.MessageParams[messageContent.messageName].objectName, messageContent.encode(), pushText || "", appData || "", function(progress: any) {
                },
                function(message: string) {
                    sendCallback.onSuccess(me.buildMessage(message));
                },
                function(message: string, code: ErrorCode) {
                    sendCallback.onError(code, me.buildMessage(message));
                }, users);
            var tempMessage: any = JSON.parse(msg);
            sendCallback.onBefore && sendCallback.onBefore(tempMessage.messageId);
            RongIMLib.MessageIdHandler.messageId = tempMessage.messageId;
        }

        registerMessageType(messageType: string, objectName: string, messageTag: MessageTag, messageContent: any): void {
            this.useConsole && console.log("registerMessageType");
            this.addon.registerMessageType(objectName, messageTag.getMessageTag());
            var regMsg = RongIMLib.ModelUtil.modleCreate(messageContent, messageType);
            RongIMLib.RongIMClient.RegisterMessage[messageType] = regMsg;
            RongIMClient.RegisterMessage[messageType].messageName = messageType;
            registerMessageTypeMapping[objectName] = messageType;
            RongIMClient.MessageType[messageType] = messageType;
            RongIMClient.MessageParams[messageType] = { objectName: objectName, msgTag: messageTag };
            typeMapping[objectName] = messageType;
        }



        addMessage(conversationType: ConversationType, targetId: string, message: any, callback?: ResultCallback<Message>): void {
            this.useConsole && console.log("addMessage");
            var direction = message.direction;
            var msg: string = this.addon.insertMessage(conversationType, targetId, message.senderUserId, message.objectName, JSON.stringify(message.content),
                function() {
                    callback.onSuccess(me.buildMessage(msg));
                },
                function() {
                    callback.onError(ErrorCode.MSG_INSERT_ERROR);
                }, direction), me = this;
        }

        removeMessage(conversationType: ConversationType, targetId: string, delMsgs: DeleteMessage[], callback: ResultCallback<boolean>): void {

        }

        removeLocalMessage(conversationType: ConversationType, targetId: string, timestamps: number[], callback: ResultCallback<boolean>): void {
            try {
                this.useConsole && console.log("removeLocalMessage");
                this.addon.deleteMessages(timestamps);
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }

        getMessage(messageId: string, callback: ResultCallback<Message>): void {
            try {
                this.useConsole && console.log("getMessage");
                var msg: Message = this.buildMessage(<string>this.addon.getMessage(messageId));
                callback.onSuccess(msg);
            } catch (e) {
                callback.onError(e);
            }
        }

        clearMessages(conversationType: ConversationType, targetId: string, callback: ResultCallback<boolean>): void {
            try {
                this.useConsole && console.log("clearMessages");
                this.addon.clearMessages(conversationType, targetId);
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }


        getConversation(conversationType: ConversationType, targetId: string, callback: ResultCallback<Conversation>): void {
            try {
                this.useConsole && console.log("getConversation");
                var ret: string = this.addon.getConversation(conversationType, targetId);
                callback.onSuccess(this.buildConversation(ret));
            } catch (e) {
                callback.onError(e);
            }
        }

        getConversationList(callback: ResultCallback<Conversation[]>, conversationTypes?: ConversationType[], count?: number,isGetHiddenConvers?:boolean): void {
            this.useConsole && console.log("getConversationList");
            this.getRemoteConversationList(callback, conversationTypes, count,isGetHiddenConvers);
        }

        clearConversations(conversationTypes: ConversationType[], callback: ResultCallback<boolean>): void {
            try {
                this.useConsole && console.log("clearConversations");
                this.addon.clearConversations();
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }

        setMessageContent(messageId:number, content:any, objectName:string):void{
            this.addon.setMessageContent(messageId, content, objectName);
        }

        getHistoryMessages(conversationType: ConversationType, targetId: string, timestamp: number, count: number, callback: GetHistoryMessagesCallback, objectname?:string, direction?: boolean): void {
            this.useConsole && console.log("getHistoryMessages");
            if (count <= 0) {
                callback.onError(ErrorCode.TIMEOUT);
                return;
            }
            objectname = objectname || '';
            try {
                var ret: string = this.addon.getHistoryMessages(conversationType, targetId, timestamp ? timestamp : 0, count, objectname, direction);
                var list: any[] = ret ? JSON.parse(ret).list : [], msgs: Message[] = [], me = this;
                list.reverse();
                for (var i = 0, len = list.length; i < len; i++) {
                    var message = me.buildMessage(list[i].obj);
                    message.sentStatus = RongIMLib.SentStatus.READ;
                    msgs[i] = message;
                }
                callback.onSuccess(msgs, len == count);
            } catch (e) {
                callback.onError(e);
            }
        }


        clearHistoryMessages(params: any, callback: ResultCallback<boolean>):void{
            callback.onSuccess(true);
        }


        getTotalUnreadCount(callback: ResultCallback<number>, conversationTypes?: number[]): void {
            try {
                var result: number;
                this.useConsole && console.log("getTotalUnreadCount");
                if (conversationTypes) {
                    result = this.addon.getTotalUnreadCount(conversationTypes);
                } else {
                    result = this.addon.getTotalUnreadCount();
                }
                callback.onSuccess(result);
            } catch (e) {
                callback.onError(e);
            }
        }

        getConversationUnreadCount(conversationTypes: ConversationType[], callback: ResultCallback<number>): void {
            this.useConsole && console.log("getConversationUnreadCount");
            this.getTotalUnreadCount(callback, conversationTypes);
        }

        getUnreadCount(conversationType: ConversationType, targetId: string, callback: ResultCallback<number>): void {
            try {
                this.useConsole && console.log("getUnreadCount");
                var result: number = this.addon.getUnreadCount(conversationType, targetId);
                callback.onSuccess(result);
            } catch (e) {
                callback.onError(e);
            }
        }

        clearUnreadCount(conversationType: ConversationType, targetId: string, callback: ResultCallback<boolean>): void {
            try {
                this.useConsole && console.log("clearUnreadCount");
                var result = this.addon.clearUnreadCount(conversationType, targetId);
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }

        clearUnreadCountByTimestamp(conversationType: ConversationType, targetId: string, timestamp:number, callback: ResultCallback<boolean>) : void{
            try {
                this.useConsole && console.log("clearUnreadCountByTimestamp");
                var result = this.addon.clearUnreadCountByTimestamp(conversationType, targetId,timestamp);
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }

        setConversationToTop(conversationType: ConversationType, targetId: string, isTop: boolean, callback: ResultCallback<boolean>): void {
            try {
                this.useConsole && console.log("setConversationToTop");
                this.addon.setConversationToTop(conversationType, targetId, isTop);
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }

        setConversationHidden(conversationType: ConversationType, targetId: string,isHidden:boolean):void {
            this.addon.setConversationHidden(conversationType,targetId,isHidden);
        }

        setMessageReceivedStatus(messageId: string, receivedStatus: ReceivedStatus, callback: ResultCallback<boolean>): void {
            try {
                this.useConsole && console.log("setMessageReceivedStatus");
                this.addon.setMessageReceivedStatus(messageId, receivedStatus);
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }

        setMessageSentStatus(messageId: string, sentStatus: SentStatus, callback: ResultCallback<boolean>): void {
            try {
                this.useConsole && console.log("setMessageSentStatus");
                this.addon.setMessageSentStatus(messageId, sentStatus);
                callback.onSuccess(true);
            } catch (e) {
                callback.onError(e);
            }
        }

        getFileToken(fileType: FileType, callback: ResultCallback<any>): void {
            this.useConsole && console.log("getFileToken");
            this.addon.getUploadToken(fileType, function(token: string) {
                callback.onSuccess({ token: token });
            },
                function(errorCode: ErrorCode) {
                    callback.onError(errorCode);
                }
            );
        }

        getFileUrl(fileType: FileType, fileName: string, oriName: string, callback: ResultCallback<any>): void {
            this.useConsole && console.log("getFileUrl");
            this.addon.getDownloadUrl(fileType, fileName, oriName,
                function(url: string) {
                    callback.onSuccess({ downloadUrl: url });
                },
                function(errorCode: ErrorCode) {
                    callback.onError(errorCode);
                }
            );
        }

        searchConversationByContent(keyword: string, callback: ResultCallback<Conversation[]>, conversationTypes?: ConversationType[]): void {
            var converTypes: ConversationType[] = [];
            if (typeof conversationTypes == 'undefined') {
                converTypes = [1, 2, 3, 4, 5, 6, 7];
            } else {
                converTypes = conversationTypes;
            }
            try {
                this.useConsole && console.log("searchConversationByContent");
                var result: string = this.addon.searchConversationByContent(converTypes, keyword);
                var list: any[] = JSON.parse(result).list, convers: Conversation[] = [], me = this;
                list.reverse();
                for (let i = 0, len = list.length; i < len; i++) {
                    convers[i] = me.buildConversation(list[i].obj);
                }
                callback.onSuccess(convers);
            } catch (e) {
                callback.onError(e);
            }
        }

        searchMessageByContent(conversationType: ConversationType, targetId: string, keyword: string, timestamp: number, count: number, total: number, callback: ResultCallback<Message[]>): void {
            var me = this
            try {
                this.useConsole && console.log("searchMessageByContent");
                this.addon.searchMessageByContent(conversationType, targetId, keyword, timestamp, count, total, function(ret: string, matched: number) {
                    var list: any[] = ret ? JSON.parse(ret).list : [], msgs: Message[] = [];
                    list.reverse();
                    for (let i = 0, len = list.length; i < len; i++) {
                        msgs[i] = me.buildMessage(list[i].obj);
                    }
                    callback.onSuccess(msgs, matched);
                });

            } catch (e) {
                callback.onError(e);
            }

        }

        getChatRoomInfo(chatRoomId: string, count: number, order: GetChatRoomType, callback: ResultCallback<any>): void {
            this.useConsole && console.log("getChatRoomInfo");
            this.addon.getChatroomInfo(chatRoomId, count, order, function(ret: string, count: number) {
                var list: any[] = ret ? JSON.parse(ret).list : [], chatRoomInfo: any = { userInfos: [], userTotalNums: count };
                if (list.length > 0) {
                    for (let i = 0, len = list.length; i < len; i++) {
                        chatRoomInfo.userInfos.push(JSON.parse(list[i].obj));
                    }
                }
                callback.onSuccess(chatRoomInfo);
            }, function(errcode: ErrorCode) {
                callback.onError(errcode);
            });
        }

        setChatroomHisMessageTimestamp(chatRoomId:string, timestamp:number):void{

        }
        
        getChatRoomHistoryMessages(chatRoomId:string, count:number, order:number, callback:ResultCallback<Message>):void{
            
        }

        getDelaTime():number{
            return this.addon.getDeltaTime();
        }

        getUserStatus(userId:string, callback:ResultCallback<UserStatus>) : void{
            var me = this;
            this.addon.getUserStatus(userId,function(status:string){
                var entity = RongInnerTools.convertUserStatus({ 
                    status: status,
                    userId: ''
                });
                callback.onSuccess(entity);
            },function(code:ErrorCode){
                callback.onError(code);
            });
        }

        setUserStatus(status:number, callback:ResultCallback<boolean>) : void{
            this.addon.setUserStatus(status,function(){
                callback.onSuccess(true);
            },function(code:ErrorCode){
                callback.onError(code);
            });
        }

        subscribeUserStatus(userIds:string[], callback:ResultCallback<boolean> ): void{
            this.addon.subscribeUserStatus(userIds,function() {
                callback && callback.onSuccess(true);
            }, function(code:ErrorCode) {
                callback && callback.onError(code);
            });
        }

        setUserStatusListener(params: any, callback:Function) : void{
           var me = this;
           this.addon.setOnReceiveStatusListener(function(userId:string, status:string){
               var entity = RongInnerTools.convertUserStatus({
                   userId: userId,
                   status: status
               });
               RongIMClient.userStatusObserver.notify({
                   key: userId,
                   entity: entity
               });
           });
           var userIds = params.userIds || [];
           if (userIds.length) {
               RongIMClient._dataAccessProvider.subscribeUserStatus(userIds);
           }
        }

        getUnreadMentionedMessages(conversationType:ConversationType, targetId:string):any{
            var me = this;
            var mentions = JSON.parse(me.addon.getUnreadMentionedMessages(conversationType, targetId)).list;
            for(var i =0,len = mentions.length;i<len;i++){
                var temp = JSON.parse(mentions[i].obj);
                temp.content = JSON.parse(temp.content);
                mentions[i] = temp;
            }
            return mentions;
        }

        hasRemoteUnreadMessages(token: string, callback: ResultCallback<Boolean>): void {
            callback.onSuccess(false);
        }

        sendRecallMessage(content:any, sendMessageCallback: SendMessageCallback): void {
           var me = this;
           me.addon.recallMessage("RC:RcCmd", JSON.stringify(content), content.push || "",
            function() {
                content.objectName = 'RC:RcCmd';
                sendMessageCallback.onSuccess(me.buildMessage(JSON.stringify(content)));
            },
            function(errorCode: any) {
              sendMessageCallback.onError(errorCode);
           });
        }

        updateMessage(message: Message, callback?: ResultCallback<Message>): void { }

        updateMessages(conversationType: ConversationType, targetId: string, key: string, value: any, callback: ResultCallback<boolean>): void { }

        reconnect(callback: ConnectCallback): void { }

        sendReceiptResponse(conversationType: ConversationType, targetId: string, sendCallback: SendMessageCallback): void { }

        setMessageExtra(messageId: string, value: string, callback: ResultCallback<boolean>): void { }

        addMemberToDiscussion(discussionId: string, userIdList: string[], callback: OperationCallback): void { }

        createDiscussion(name: string, userIdList: string[], callback: CreateDiscussionCallback): void { }

        getDiscussion(discussionId: string, callback: ResultCallback<Discussion>): void { }

        quitDiscussion(discussionId: string, callback: OperationCallback): void { }

        removeMemberFromDiscussion(discussionId: string, userId: string, callback: OperationCallback): void { }

        setDiscussionInviteStatus(discussionId: string, status: DiscussionInviteStatus, callback: OperationCallback): void { }

        setDiscussionName(discussionId: string, name: string, callback: OperationCallback): void { }

        setDeviceId(deviceId: string):void{
            this.addon.setDeviceId(deviceId);
        }

        setEnvironment(isPrivate: boolean):void{
            this.addon.setEnvironment(isPrivate);
        }

        addConversation(conversation: Conversation, callback: ResultCallback<boolean>): void { }

        updateConversation(conversation: Conversation): Conversation {
            return null;
        }

        getConversationNotificationStatus(params:any, callback: any):void{
            var conversationType = params.conversationType;
            var targetId = params.targetId;

            var notification = RongIMClient._memoryStore.notification;
            var key = conversationType + '_' + targetId;

            var status = notification[key];
            if (typeof status == 'number') {
                callback.onSuccess(status);
                return;
            }
            
            this.addon.getConversationNotificationStatus(conversationType, targetId, function(status:any) {
                notification[key] = status;
                callback.onSuccess(status);
            },
            function(error:any) {
                callback.onError(error);
            });
        }

        setConversationNotificationStatus(params:any, callback: any):void{
            var conversationType = params.conversationType;
            var targetId = params.targetId;
            var status = params.status;

            var notification = RongIMClient._memoryStore.notification;
            var key = conversationType + '_' + targetId;

            notification[key] = status;

            var notify:boolean = !!status;

            this.addon.setConversationNotificationStatus(conversationType, targetId, notify, function() {
                callback.onSuccess(status);
            },
            function(error:any) {
                callback.onError(error);
            });
        }

        getCurrentConnectionStatus(): number{
            return this.addon.getConnectionStatus();
        }

        getAgoraDynamicKey(engineType: number, channelName: string, callback: ResultCallback<string>) {
          var extra = "";
          this.addon.getVoIPKey(engineType, channelName, extra,
            function(token: string) {
                callback.onSuccess(token);
            },
            function(errorCode: any) {
                  callback.onError(errorCode);
            });
        }

        getPublicServiceProfile(publicServiceType: ConversationType, publicServiceId: string, callback: ResultCallback<PublicServiceProfile>) {
            var profile = RongIMClient._memoryStore.publicServiceMap.get(publicServiceType, publicServiceId);
            callback.onSuccess(profile);
        }

        getRemotePublicServiceList(callback?: ResultCallback<PublicServiceProfile[]>, pullMessageTime?: any) {
            var publicList:any[] = [];
            var ret = this.addon.getAccounts();
            var transformProto = function(ret: any){
                var result:{[key: string]: any} = {
                    hasFollowed: false,
                    isGlobal: false,
                    menu: null
                };
                if (!ret.obj) {
                    var error = {error: ret}
                    throw new Error('公众账号数据格式错误: ' + JSON.stringify(error));
                }
                var obj = JSON.parse(ret.obj);
                var protoMap:{[key: string]: any} = {
                    aType: 'conversationType',
                    aId: 'publicServiceId',
                    aName: 'introduction',
                    aUri: 'portraitUri',
                    follow: 'hasFollowed',
                    isGlobal: 'isGlobal'
                };
                for(var key in obj){
                    var val = obj[key];
                    if (key == 'aExtra') {
                        var extra = JSON.parse(val);
                        result["hasFollowed"] = extra.follow;
                        result["isGlobal"] = extra.isGlobal;
                        result["menu"] = extra.menu;
                    }
                    var uId = protoMap[key];
                    if (uId) {
                        result[uId] = val;
                    }
                }
                return result;
            };
            if (ret) {
                ret = JSON.parse(ret);
                var list = ret.list;
                for(var i = 0, len = list.length; i < len; i++){
                    var item = list[i];
                    item = transformProto(item);
                    publicList.push(item);
                }
            }
            if (publicList.length > 0) {
                RongIMClient._memoryStore.publicServiceMap.publicServiceList.length = 0;
                RongIMClient._memoryStore.publicServiceMap.publicServiceList = publicList;
            }
            callback.onSuccess(RongIMClient._memoryStore.publicServiceMap.publicServiceList);
        }

        private buildMessage(result: string): Message {
            var message: Message = new Message(), ret: any = JSON.parse(result);
            message.conversationType = ret.conversationType;
            message.targetId = ret.targetId;
            message.messageDirection = ret.direction;
            message.senderUserId = ret.senderUserId;
            if(ret.direction == MessageDirection.RECEIVE) {
                message.receivedStatus = ret.status;
            }else if(ret.direction == MessageDirection.SEND){
                message.sentStatus = ret.status;
            }
            message.sentTime = ret.sentTime;
            message.objectName = ret.objectName;
            var content = ret.content ? JSON.parse(ret.content) : ret.content;
            var messageType = typeMapping[ret.objectName] || registerMessageTypeMapping[ret.objectName];
            if(content){
                content.messageName = messageType;
            }
            message.content = content;
            message.messageId = ret.messageId;
            message.messageUId = ret.messageUid;
            message.messageType = messageType;
            return message;
        }

        private buildConversation(val: string): Conversation {
            var conver: Conversation = new Conversation(),
                c: any = JSON.parse(val),
                lastestMsg: any = c.lastestMsg ? this.buildMessage(c.lastestMsg) : {};
            conver.conversationTitle = c.title;
            conver.conversationType = c.conversationType;
            conver.draft = c.draft;
            conver.isTop = c.isTop;
            conver.isHidden = c.isHidden;
            lastestMsg.conversationType = c.conversationType;
            lastestMsg.targetId = c.targetId;
            conver.latestMessage = lastestMsg;
            conver.latestMessageId = lastestMsg.messageId;
            conver.latestMessage.messageType = typeMapping[lastestMsg.objectName] || registerMessageTypeMapping[lastestMsg.objectName];
            conver.objectName = lastestMsg.objectName;
            conver.receivedStatus = ReceivedStatus.READ;
            conver.sentTime = lastestMsg.sentTime;
            conver.senderUserId = lastestMsg.senderUserId;
            conver.sentStatus = lastestMsg.status;
            conver.targetId = c.targetId;
            conver.unreadMessageCount = c.unreadCount;
            conver.hasUnreadMention = c.m_hasUnreadMention;
            var mentions = this.getUnreadMentionedMessages(c.conversationType, c.targetId);
            if (mentions.length > 0) {
                // 取最后一条 @ 消息,原因：和 web 互相兼容
                var mention = mentions.pop();
                conver.mentionedMsg = { uid: mention.messageUid, time: mention.sentTime, mentionedInfo: mention.content.mentionedInfo, sendUserId: mention.senderUserId };
            }
            return conver;
        }
    }
}
