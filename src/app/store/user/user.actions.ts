import { createAction, props } from '@ngrx/store';
import { User } from './user.model';

export namespace UserActions {
  export const receiveUserDetails = createAction('[user] receive user details', props<{user: User}>());
  export const updateUserDetails = createAction('[user]: update user details', props<{user: User}>());
}