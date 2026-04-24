import { createContext, useContext, useReducer, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, user: action.payload, loading: false, error: null };
    case "LOGOUT":
      return { ...state, user: null, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }
      try {
        const { data } = await API.get("/auth/me");
        dispatch({ type: "LOGIN_SUCCESS", payload: data });
      } catch {
        localStorage.removeItem("token");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      dispatch({ type: "LOGIN_SUCCESS", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.message || "Login failed" });
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const { data } = await API.post("/auth/register", { name, email, password, role });
      localStorage.setItem("token", data.token);
      dispatch({ type: "LOGIN_SUCCESS", payload: data });
      return data;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.response?.data?.message || "Registration failed" });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
