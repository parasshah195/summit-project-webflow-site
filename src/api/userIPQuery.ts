interface IPResponse {
  ip: string | null;
}

export const getUserIPAddress = async (): Promise<IPResponse> => {
  const IP_API = 'https://api.ipify.org/?format=json';

  const response = await fetch(IP_API, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`Unable to fetch IP address:`);
    console.error(response, response.statusText);

    // in error return a random IP address that will default to the "Other" market
    return {
      ip: '100.100.100.100',
    };
  }

  const responseJSON: Promise<IPResponse> = await response.json();
  return responseJSON;
};
