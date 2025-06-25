export const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    // In a real application, you might want to throw an error
    // or have a more robust configuration management strategy.
    console.warn("NEXT_PUBLIC_API_URL is not set. Falling back to default.");
    return "http://127.0.0.1:5001";
  }

  return apiUrl;
}; 