//User
export interface IUserDTO {
    display?: string;
    email: string;
    uid: string;
    firstName?: string | null;
    lastName?: string | null;
}

export declare interface IUserState {
    mentionsList: Array<IMentionList>;
    userMap: IUserMap;
    currentUser: IUserDTO;
}

export declare type IUserMap = { [key: string]: IUserDTO };

// Invite Metadata and Context
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
    uid?: string;
}

export declare type IMentionedList = Array<IMentionItem>;

// Comment State
export declare interface ICommentState {
    message: string;
    toUsers?: Array<IMentionItem>;
    images?: string[];
    createdBy: string;
    author: string;
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
    updatedAt?: string;
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
    onDeleteThread: (data: IDeleteThreadArgs) => void;
    setThreadState: (
        state:
            | IThreadPopupState
            | ((prevState: IThreadPopupState) => IThreadPopupState)
    ) => void;
    onClose: (isResolved?: boolean) => void;
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

export interface IThreadRenderStatus {
    threadId: string;
    attempts: number;
    isRendered: boolean;
}

export interface ICommentDTO {
    _id: string;
    threadUid: string;
    message: string;
    author: string;
    toUsers: string[];
    images: string[];
    createdAt: string;
    createdBy: string;
    updatedAt?: string;
}

export interface IDefaultAPIResponse {
    notice: string;
}

export interface ICommentResponse extends IDefaultAPIResponse {
    comment: ICommentDTO;
}

export interface IFetchCommentsResponse {
    comments: Array<ICommentDTO>;
    count: number;
}

export interface ICommentPayload {
    threadUid: string;
    commentPayload: ICommentState;
}
export interface IThreadPayload {
    elementXPath: string;
    position: {
        x: number;
        y: number;
    };
    author: string;
    pageRoute: string;
    inviteUid: string;
    createdBy: string;
}

export interface IThreadDTO {
    _id: string;
    author: string;
    inviteUid: string;
    position: {
        x: number;
        y: number;
    };
    elementXPath: string;
    isElementPresent: boolean;
    pageRoute: string;
    createdBy: string;
    sequenceNumber: number;
    threadState: number;
    createdAt: string;
    updatedAt?: string;
}
export interface IThreadResponseDTO extends IDefaultAPIResponse {
    thread: IThreadDTO;
}

export interface IEditCommentArgs {
    threadUid: string;
    commentUid: string;
    payload: ICommentState;
}

export interface IDeleteCommentArgs {
    threadUid: string;
    commentUid: string;
}

export interface IDeleteThreadArgs {
    threadUid: string;
}

export interface IThreadResolveArgs {
    threadUid: string;
    payload: {
        threadState: number;
    };
}

export interface MissingThreadsInfo {
    payload: {
        isElementPresent: boolean;
    };
    threadUids: string[];
}

export interface IErrorState {
    hasError: boolean;
    message: string;
}

export interface IActiveThread extends Partial<IThreadDTO> {
    _id: string;
}

export interface IFetchComments {
    threadUid: string;
    offset: number;
    limit: number;
}

export interface toggleCollabPopupEvent {
    threadUid: string;
    action: string;
}

export interface ICommentActionBar {
    mode: "edit" | "view";
    commentUser: IUserDTO;
    currentUser: IUserDTO;
    commentUID?: string | undefined;
}

export interface ICommentCard {
    comment: IMessageDTO | null;
    onClose: (isResolved?: boolean) => void;
    userState: IUserState;
    mode: "edit" | "view";
    handleOnSaveRef: React.MutableRefObject<any>;
}

export interface ICommentResolvedText {
    comment: IMessageDTO;
    userState: IUserState;
}

export interface ICommentTextAreaProps {
    userState: IUserState;
    onClose: (isResolved?: boolean) => void;
    handleOnSaveRef: React.MutableRefObject<any>;
    comment?: IMessageDTO | null;
}

export interface IThreadPopup {
    onCreateComment: (data: ICommentPayload) => Promise<ICommentResponse>;
    onEditComment: (data: IEditCommentArgs) => Promise<ICommentResponse>;
    onDeleteComment: (data: IDeleteCommentArgs) => Promise<IDefaultAPIResponse>;
    onDeleteThread: (data: IDeleteThreadArgs) => void;
    onClose: (isResolved?: boolean) => void;
    onResolve: (data: IThreadResolveArgs) => Promise<IThreadResponseDTO>;
    inviteMetadata: IInviteMetadata;
    loadMoreMessages: (data: IFetchComments) => Promise<IFetchCommentsResponse>;
    activeThread: IActiveThread;
    setActiveThread: (thread: IActiveThread) => void;
    createNewThread: () => Promise<IThreadResponseDTO>;
}

export interface IThreadBody {
    handleOnSaveRef: React.MutableRefObject<any>;
    onClose: (isResolved?: boolean) => void;
    userState: IUserState;
    isLoading: boolean;
    comments: IMessageDTO[];
    fetchingMore: boolean;
    editComment: string;
}

export interface IThreadFooter {
    onClose: (isResolved?: boolean) => void;
    handleOnSaveRef: React.MutableRefObject<any>;
    isDisabled: boolean;
    editComment: string;
}

export interface IThreadHeader {
    onClose: (isResolved?: boolean) => void;
    displayResolve: boolean;
    onResolve: (data: IThreadResolveArgs) => Promise<IDefaultAPIResponse>;
    commentCount: number;
    activeThread: IActiveThread;
}

export interface ICollabConfig {
    collab: {
        fromShare: boolean;
        pauseFeedback: boolean;
        enable: boolean;
        isFeedbackMode: boolean;
        inviteMetadata: IInviteMetadata;
        payload: IThreadDTO[];
    };
}

export interface IThreadIdentifier {
    threadUid: string;
}

export interface IThreadRemove {
    threadUids: string[];
    updateConfig?: boolean;
}

export interface IThreadReopen {
    thread: IThreadDTO;
}
