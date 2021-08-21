import { Space, SpaceWithRelated, UserStatus } from '../api/spaces';
import { Action } from '../actions';
import { AppResult } from '../api/request';
import { errLoading } from '../api/error';
import { JoinedSpace, LeftSpace, SpaceEdited, UserEdited } from '../actions/profile';
import { Id } from '../utils/id';
import { Map } from 'immutable';
import { User } from '../api/users';
import { Ok } from '../utils/result';
import { Channel } from '../api/channels';
import { StatusMap } from '../api/events';

export interface UiState {
  exploreSpaceList: AppResult<Space[]>;
  spaceSet: Map<Id, AppResult<SpaceWithRelated>>;
  userSet: Map<Id, AppResult<User>>;
  connection: WebSocket | null;
  spaceId: Id | undefined;
}

export const initUiState: UiState = {
  spaceId: undefined,
  exploreSpaceList: errLoading(),
  spaceSet: Map<Id, AppResult<SpaceWithRelated>>(),
  userSet: Map<Id, AppResult<User>>(),
  connection: null,
};

const handleJoinSpace = (state: UiState, action: JoinedSpace): UiState => {
  let { spaceSet } = state;
  const userResult = state.userSet.get(action.member.userId);
  if (!userResult || userResult.isErr) {
    return state;
  }
  const user = userResult.value;
  spaceSet = spaceSet.update(action.space.id, errLoading(), (result) =>
    result.map(({ members, ...rest }) => {
      members = { ...members, [user.id]: { space: action.member, user } };
      return { ...rest, members };
    })
  );
  return { ...state, spaceSet };
};

const handleLeftSpace = ({ spaceSet, ...state }: UiState, action: LeftSpace, userId: Id | undefined): UiState => {
  spaceSet = spaceSet.update(action.spaceId, errLoading(), (result) =>
    result.map(({ members, ...rest }) => {
      if (!userId) {
        return { ...rest, members };
      }
      const { [userId]: _, ...restMembers } = members;
      return { ...rest, members: restMembers };
    })
  );
  return { ...state, spaceSet };
};

const handleSpaceEdited = ({ spaceSet, ...state }: UiState, { space }: SpaceEdited): UiState => {
  spaceSet = spaceSet.update(space.id, errLoading(), (result) =>
    result.map((spaceWithRelated) => ({ ...spaceWithRelated, space }))
  );
  return { ...state, spaceSet };
};

const handleChannel = (state: UiState, channel: Channel): UiState => {
  let { spaceSet } = state;
  const result: AppResult<SpaceWithRelated> = spaceSet.get(channel.spaceId, errLoading());
  if (!result || !result.isOk) {
    return state;
  }
  let updated = false;
  const channels = result.value.channels.map((item) => {
    if (item.id !== channel.id) {
      return item;
    } else {
      updated = true;
      return channel;
    }
  });
  if (!updated) {
    channels.push(channel);
  }
  const spaceWithRelated: SpaceWithRelated = { ...result.value, channels };
  spaceSet = spaceSet.set(spaceWithRelated.space.id, new Ok(spaceWithRelated));
  return { ...state, spaceSet };
};

const handleUserEdited = ({ userSet, ...state }: UiState, { user }: UserEdited): UiState => {
  userSet = userSet.set(user.id, new Ok(user));
  return { ...state, userSet };
};

const handleUpdateSpaceUserStatus = (state: UiState, action: StatusMap): UiState => {
  const spaceResult = state.spaceSet.get(action.spaceId);
  if (!spaceResult?.isOk) {
    return state;
  }
  const space = spaceResult.value;
  const usersStatus = action.statusMap;
  const spaceSet = state.spaceSet.set(action.spaceId, new Ok({ ...space, usersStatus }));
  return { ...state, spaceSet };
};

const handleSpaceWithRelatedResult = (state: UiState, spaceId: Id, result: AppResult<SpaceWithRelated>): UiState => {
  let { spaceSet, exploreSpaceList, userSet } = state;
  spaceSet = spaceSet.set(spaceId, result);
  if (result.isOk) {
    const newSpace = result.value.space;
    exploreSpaceList = exploreSpaceList.map((spaces) =>
      spaces.map((space) => {
        if (space.id !== spaceId) {
          return space;
        } else {
          return newSpace;
        }
      })
    );
    for (const member of Object.values(result.value.members)) {
      if (!member) {
        continue;
      }
      userSet = userSet.set(member.user.id, new Ok(member.user));
    }
  }
  return { ...state, spaceSet, spaceId, exploreSpaceList, userSet };
};

const removeSpace = (state: UiState, spaceId: Id): UiState => {
  let { spaceSet, exploreSpaceList } = state;
  spaceSet = spaceSet.remove(spaceId);
  exploreSpaceList = exploreSpaceList.map((spaces) => spaces.filter((space) => space.id !== spaceId));
  return { ...state, spaceSet, exploreSpaceList };
};

export function uiReducer(state: UiState = initUiState, action: Action, userId: Id | undefined): UiState {
  switch (action.type) {
    case 'EXPLORE_SPACE_LOADED':
      return { ...state, exploreSpaceList: action.spaces };
    case 'SPACE_LOADED':
      return handleSpaceWithRelatedResult(state, action.spaceId, action.result);
    case 'SPACE_UPDATED':
      return handleSpaceWithRelatedResult(state, action.spaceWithRelated.space.id, new Ok(action.spaceWithRelated));
    case 'SPACE_DELETED':
      return removeSpace(state, action.spaceId);
    case 'USER_LOADED':
      return { ...state, userSet: state.userSet.set(action.userId, action.result) };
    case 'LOGGED_IN':
      return { ...state, userSet: state.userSet.set(action.user.id, new Ok(action.user)) };
    case 'USER_EDITED':
      return handleUserEdited(state, action);
    case 'JOINED_SPACE':
      return handleJoinSpace(state, action);
    case 'JOINED_CHANNEL':
      return handleChannel(state, action.channel);
    case 'LEFT_SPACE':
      return handleLeftSpace(state, action, userId);
    case 'SPACE_EDITED':
      return handleSpaceEdited(state, action);
    case 'CONNECT_SPACE':
      return { ...state, connection: action.connection };
    case 'EVENT_RECEIVED':
      switch (action.event.body.type) {
        case 'CHANNEL_EDITED':
          return handleChannel(state, action.event.body.channel);
        case 'STATUS_MAP':
          return handleUpdateSpaceUserStatus(state, action.event.body);
      }
  }
  return state;
}
