export var MessageType;
(function (MessageType) {
    MessageType[MessageType["Log"] = 1] = "Log";
    MessageType[MessageType["Error"] = 2] = "Error";
    MessageType[MessageType["Warning"] = 3] = "Warning";
    MessageType[MessageType["Info"] = 4] = "Info";
    MessageType[MessageType["Debug"] = 5] = "Debug";
    MessageType[MessageType["All"] = 6] = "All";
})(MessageType || (MessageType = {}));
