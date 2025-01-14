//User and Roles
export declare interface IUserDTO {
    display?: string;
    uid: string;
    first_name: string;
    last_name: string;
    active: boolean;
    email: string;
    username: string;
}

export declare interface IUserState {
    mentionsList: Array<IMentionList>;
    userMap: IUserMap;
    roleMap: IRoleMap;
    currentUser: IUserDTO;
}

export declare interface IRoleDTO {
    uid: string;
    name: string;
}

export declare type IUserMap = { [key: string]: IUserDTO };
export declare type IRoleMap = { [key: string]: IRoleDTO };

// Stack Metadata and Context
export declare interface IStackMetadata {
    users: Array<IUserDTO>;
    roles: Array<IRoleDTO>;
    currentUser: IUserDTO;
    invite: { id: string };
}

// Mention Related Types
export declare type IMentionItem = { id: string; display: string };

export declare interface IMentionList {
    display: string;
    id: string;
    uid: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
}

export declare type IMentionedList = Array<IMentionItem>;

// Comment State
export declare interface ICommentState {
    message: string;
    to_users: Array<IMentionItem>;
    to_roles: Array<IMentionItem>;
}

// Message DTO
export declare interface IMessageDTO {
    discussion_uid: string;
    uid: string;
    to_users?: Array<string>;
    to_roles?: Array<string>;
    message: string;
    entry_uid: string;
    locale: string;
    created_at: string;
    created_by: string;
}

// Discussion Context
export declare interface IDiscussionContext {
    stackMetadata: IStackMetadata;
    commentCount: number;
    error: IErrorState;
    userState: IUserState;
    onCreateComment: (data: ICommentPayload) => Promise<ICommentResponse>;
    onEditComment: (data: IEditCommentArgs) => Promise<ICommentResponse>;
    onDeleteComment: (data: IDeleteCommentArgs) => Promise<IDefaultAPIResponse>;
    setDiscussionState: (
        state:
            | IDiscussionPopupState
            | ((prevState: IDiscussionPopupState) => IDiscussionPopupState)
    ) => void;
    onClose: () => void;
    setError: Function;
    editComment: string;
    activeDiscussion: IActiveDiscussion;
    setActiveDiscussion: (discussion: IActiveDiscussion) => void;
    createNewDiscussion: () => Promise<any>;
}

export interface IDiscussionPopupState {
    commentCount: number;
    userState: IUserState;
    isLoading: boolean;
    comments: Array<IMessageDTO>;
    editComment: string;
}

export interface ICommentDTO {
    discussion_uid: string;
    uid: string;
    to_users: string[];
    to_roles: string[];
    message: string;
    created_at: string;
    created_by: string;
    deleted_at: boolean;
    entry_uid: string;
    locale: string;
    updated_at?: string;
}

export interface IDefaultAPIResponse {
    notice: string;
}

export interface ICommentResponse extends IDefaultAPIResponse {
    conversation: ICommentDTO;
}

export interface ICommentPayload extends ICommentState {
    discussion_uid: string;
}

interface Field {
    uid: string;
    path: string;
    og_path: string;
}

export interface IDiscussionDTO {
    title: string;
    entry_uid: string;
    uid: string;
    api_key: string;
    org_uid: string;
    _content_type_uid: string;
    locale: string;
    status: number;
    field: Field;
    created_at: string;
    created_by: string;
    updated_at?: string;
    updated_by?: string;
    unread?: boolean;
}
export interface IDiscussionResponseDTO extends IDefaultAPIResponse {
    discussion: IDiscussionDTO;
}

export interface IEditCommentArgs {
    commentUID: string;
    payload: ICommentPayload;
}

export interface IDeleteCommentArgs {
    discussionUID: string;
    commentUID: string;
}

export interface IErrorState {
    hasError: boolean;
    message: string;
}

export interface IActiveDiscussion
    extends Partial<Pick<IDiscussionDTO, "title" | "field">> {
    uid: string;
}
