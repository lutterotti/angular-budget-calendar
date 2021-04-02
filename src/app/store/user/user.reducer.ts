import { createReducer, on } from '@ngrx/store';
import { User } from './user.model';
import { UserActions } from './user.actions';

const initial_state: User = {
  email: null,
  user_id: null
}

const receiveUserDetails = on(UserActions.receiveUserDetails, (state: User, {user}) => {
  return user;
})

export const UserReducer = createReducer(
  initial_state,
  receiveUserDetails
)