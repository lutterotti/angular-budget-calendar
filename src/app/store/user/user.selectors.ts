import { createSelector } from 'reselect';
import { userSelector } from '../app.selector';
import { User } from './user.model';

export const getUserData = createSelector(userSelector, (state: User) => state ? state : {} as User);
export const getUserId = createSelector(getUserData, (user: User) => user.user_id);
export const isUserLoggedIn = createSelector(getUserData, (state: User) => state ? !!state.user_id : false);

export const UserSelectors = {
  getUserData,
  getUserId,
  isUserLoggedIn
}
