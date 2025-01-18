//User and Roles
export declare interface IUserDTO {
    display?: string;
    email: string;
    identityHash: string;
}

export declare interface IUserState {
    mentionsList: Array<IMentionList>;
    userMap: IUserMap;
    currentUser: IUserDTO;
}

export declare type IUserMap = { [key: string]: IUserDTO };

// Stack Metadata and Context
export declare interface IInviteMetadata {
    users: Array<IUserDTO>;
    currentUser: IUserDTO;
    inviteUid: string;
}

// Mention Related Types
export declare type IMentionItem = { id: string; display: string };

export declare interface IMentionList {
    display: string;
    email?: string;
    identityHash?: string;
}

export declare type IMentionedList = Array<IMentionItem>;

// Comment State
export declare interface ICommentState {
    message: string;
    toUsers?: Array<IMentionItem>;
    images?: string[];
}

// Message DTO
export declare interface IMessageDTO {
    _id: string;
    threadUid: string;
    message: string;
    author: string;
    toUsers?: string[];
    images?: string[];
    createdAt: string;
    createdBy: string;
}

// Thread Context
export declare interface IThreadContext {
    inviteMetadata: IInviteMetadata;
    commentCount: number;
    error: IErrorState;
    userState: IUserState;
    onCreateComment: (data: ICommentPayload) => Promise<ICommentResponse>;
    onEditComment: (data: IEditCommentArgs) => Promise<ICommentResponse>;
    onDeleteComment: (data: IDeleteCommentArgs) => Promise<IDefaultAPIResponse>;
    setThreadState: (
        state:
            | IThreadPopupState
            | ((prevState: IThreadPopupState) => IThreadPopupState)
    ) => void;
    onClose: () => void;
    setError: Function;
    editComment: string;
    activeThread: IActiveThread;
    setActiveThread: (thread: IActiveThread) => void;
    createNewThread: () => Promise<any>;
}

export interface IThreadPopupState {
    commentCount: number;
    userState: IUserState;
    isLoading: boolean;
    comments: Array<IMessageDTO>;
    editComment: string;
}

export interface ICommentDTO {
    _id: string;
    threadUid: string;
    message: string;
    author: string;
    toUsers: string[];
    images: string[];
    created_at: string;
    created_by: string;
    updated_at?: string;
}

export interface IDefaultAPIResponse {
    notice: string;
}

export interface ICommentResponse extends IDefaultAPIResponse {
    comment: ICommentDTO;
}

export interface ICommentPayload extends ICommentState {
    threadUid: string;
}

export interface IThreadDTO {
    _id: string;
    author: string;
    inviteUid: number;
    position: {
        x: number;
        y: number;
    };
    elementXPath: string;
    isElementPresent: boolean;
    pageRoute: string;
    created_by: string;
    sequenceNumber: number;
    threadState: number;
    created_at: string;
}
export interface IThreadResponseDTO extends IDefaultAPIResponse {
    thread: IThreadDTO;
}

export interface IEditCommentArgs {
    commentUID: string;
    payload: ICommentPayload;
}

export interface IDeleteCommentArgs {
    threadUID: string;
    commentUID: string;
}

export interface IErrorState {
    hasError: boolean;
    message: string;
}

export interface IActiveThread
    extends Partial<Pick<IThreadDTO, "elementXPath" | "position" | "author">> {
    _id: string;
}
