const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export const getLessons = async (id) => {
  const url = id ? `${baseUrl}/lessons/${id}` : `${baseUrl}/lessons`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
};
