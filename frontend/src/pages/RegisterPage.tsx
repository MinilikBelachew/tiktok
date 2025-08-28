/* eslint-disable no-irregular-whitespace */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import TikTokBanner from "../components/ui/TikTokBanner";
import Spinner from "../components/ui/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { registerRequest, clearError } from "../store/slice/auth";
import type { RootState } from "../store/rootReducer";
import PasswordInput from "../components/ui/PasswordInput";
import PhoneNumberInput from "../components/ui/PhoneNumberInput";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error || formError) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        setFormError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, formError, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      setSuccessMessage("Account created successfully! Redirecting to home...");
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    }
  }, [isAuthenticated, navigate]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    if (!formData.email.trim()) {
      setFormError("Email is required");
      return;
    }
    if (!/.+@.+\..+/.test(formData.email)) {
      setFormError("Please enter a valid email address");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Phone number is required");
      return;
    }
    // More flexible phone validation - allow international formats
    const phoneNumber = formData.phone.trim();
    const phoneDigits = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
    
    if (phoneDigits.length < 7) {
      setFormError("Phone number is too short. Please enter a valid phone number.");
      return;
    }
    if (phoneDigits.length > 15) {
      setFormError("Phone number is too long. Please enter a valid phone number.");
      return;
    }
    // Check if it's a valid phone number format (basic check)
    if (!/^\+?[\d\s\-\(\)]+$/.test(phoneNumber)) {
      setFormError("Please enter a valid phone number format.");
      return;
    }
    if (!formData.password) {
      setFormError("Password is required");
      return;
    }
    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters long");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (!formData.username.trim()) {
      setFormError("Username is required");
      return;
    }

    const registrationData = {
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      username: formData.username,
    };
    dispatch(registerRequest(registrationData));
  };

  // Enhanced error message handling
  const getErrorMessage = (error: any) => {
    if (typeof error === "string") {
      const errorLower = error.toLowerCase();
      
      // Handle specific backend error messages
      if (errorLower.includes("email already exists") || errorLower.includes("email already registered")) {
        setFormError("An account with this email already exists. Please use a different email or try logging in.");
        return "An account with this email already exists. Please use a different email or try logging in.";
      }
      if (errorLower.includes("phone already exists") || errorLower.includes("phone already registered")) {
        setFormError("An account with this phone number already exists. Please use a different phone number or try logging in.");
        return "An account with this phone number already exists. Please use a different phone number or try logging in.";
      }
      if (errorLower.includes("username already exists") || errorLower.includes("username already taken")) {
        setFormError("This username is already taken. Please choose a different username.");
        return "This username is already taken. Please choose a different username.";
      }
      
      // Handle validation errors
      if (errorLower.includes("email")) {
        setFormError("Please enter a valid email address.");
        return "Please enter a valid email address.";
      }
      if (errorLower.includes("phone")) {
        return "Please enter a valid phone number with country code (e.g., +1234567890).";
      }
      if (errorLower.includes("password")) {
        return "Password must be at least 8 characters long and contain letters and numbers.";
      }
      if (errorLower.includes("username")) {
        return "Username must be at least 3 characters long and contain only letters, numbers, and underscores.";
      }
      if (errorLower.includes("validation")) {
        return "Please check your input and try again.";
      }
      if (errorLower.includes("network") || errorLower.includes("connection")) {
        return "Network error. Please check your internet connection and try again.";
      }
      if (errorLower.includes("server") || errorLower.includes("internal")) {
        return "Server error. Please try again in a few moments.";
      }
      
      // Return the original error if no specific pattern matches
      return error;
    }
    return "Registration failed. Please check your information and try again.";
  };

  return (
    <Layout showHeaderNavigation={false}>
           {" "}
      <div className="min-h-screen flex flex-col">
                {/* Banner Section - Full Width */}       {" "}
        <div className="w-full mb-8">
                    <TikTokBanner />       {" "}
        </div>
                {/* Form Section - Centered */}       {" "}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {(formError || error) && (
              <div className="mb-4 rounded-sm bg-red-500 text-white px-4 py-2 text-sm">
                {formError || getErrorMessage(error)}
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-white mb-4">
                <Spinner />
                <span>Creating your account...</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 rounded-sm bg-green-500 text-white px-4 py-2 text-sm">
                {successMessage}
              </div>
            )}
                                 {" "}
            <form className="space-y-6" onSubmit={handleSubmit}>
                           {" "}
              <div className="space-y-4">
                                {/* Username */}               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-white mb-2"
                  >
                                        Username                  {" "}
                  </label>
                                   {" "}
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange} // Removed `rounded-lg`
                    className="rounded-sm w-full px-4 py-3 border border-gray-600 bg-white text-dark-blue placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sunrise focus:border-transparent"
                    placeholder="Enter your username"
                  />
                                 {" "}
                </div>
                                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Phone Number
                  </label>
                  <PhoneNumberInput
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    defaultCountry="et"
                    required
                  />
                                 {" "}
                </div>
                                {/* Email */}               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2"
                  >
                                        Email                  {" "}
                  </label>
                                   {" "}
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange} // Removed `rounded-lg`
                    className="rounded-sm w-full px-4 py-3 border border-gray-600 bg-white text-dark-blue placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sunrise focus:border-transparent"
                    placeholder="Enter your email"
                  />
                                 {" "}
                </div>
                                {/* Password */}               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-white mb-2"
                  >
                                        Password                  {" "}
                  </label>
                                   {" "}
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                  />
                                 {" "}
                </div>
                                {/* Confirm Password */}               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-white mb-2"
                  >
                                        Confirm Password                  {" "}
                  </label>
                                   {" "}
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                  />
                                 {" "}
                </div>
                                {/* Terms and Conditions */}               {" "}
                <div className="flex items-center">
                                   {" "}
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    required
                    checked={formData.acceptTerms}
                    onChange={handleInputChange} // Removed `rounded`
                    className="h-4 w-4 text-sunrise focus:ring-sunrise border-gray-300"
                  />
                                   {" "}
                  <label
                    htmlFor="acceptTerms"
                    className="ml-2 block text-sm text-white"
                  >
                                        I agree to the Terms and Conditions    
                                 {" "}
                  </label>
                                 {" "}
                </div>
                             {" "}
              </div>
                            {/* Register Button */}             {" "}
              <div className="text-center">
                               {" "}
                <button
                  type="submit" // Changed to be smaller than the form and centered
                  className="rounded-sm w-2/3 bg-sunrise text-black py-3 px-4 font-bold hover:bg-opacity-80 transition-colors disabled:opacity-60"
                  disabled={loading}
                >
                                    Create Account                {" "}
                </button>
                             {" "}
              </div>
                            {/* Login Link */}             {" "}
              <div className="text-center">
                               {" "}
                <p className="text-white">
                                    Already have an account?                  {" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-sunrise cursor-pointer hover:text-opacity-80 font-semibold"
                  >
                                        Login here                  {" "}
                  </button>
                                 {" "}
                </p>
                             {" "}
              </div>
                         {" "}
            </form>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </Layout>
  );
};

export default RegisterPage;
