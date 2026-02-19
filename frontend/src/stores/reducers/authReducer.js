const storedUser = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const initialState = {
  user: storedUser,
  isLoading: false,
  error: null,
  isAuthenticated: !!storedUser,
};

export const authReducer = (state = initialState, action) => {

  switch (action.type) {

    case "AUTH_LOGIN_START":

      return {
        ...state,
        isLoading: true,
        error: null,
      };


    case "AUTH_LOGIN_SUCCESS":

      // save user in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(action.payload)
      );

      return {
        ...state,
        isLoading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };


    case "AUTH_LOGIN_FAILURE":

      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isAuthenticated: false,
      };


    case "AUTH_LOGOUT":

      localStorage.removeItem("user");

      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
      };


    default:
      return state;

  }

};
