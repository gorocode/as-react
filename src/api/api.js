import config from "../config";

// GENERIC API REQUEST
const request = async (endpoint, method = 'GET', body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${config.BASE_URL}/api${endpoint}`, options);
        if (!response.ok) {
            const errorJson = await response.json();
            console.error(`API error: ${errorJson}`);
            throw errorJson;
        }

        const text = await response.text();
        
        return text ? JSON.parse(text) : {};
    } catch (error) {
        throw error;
    }
};


/* PLAYER */
export const createPlayer = async (name, userId) => { 
    const endpoint = `/player/new`;
    return await request(endpoint, 'POST', { name, userId });
}

export const putPlayer = async (player) => {
    const endpoint = `/player`;
    return await request(endpoint, 'PUT', player);
}

export const getUserPlayers = async (userId) => { 
    const endpoint = `/player/user/${userId}`;
    return await request(endpoint);
}

export const deletePlayer = async (playerId) => { 
    const endpoint = `/player/${playerId}`;
    return await request(endpoint, 'DELETE');
}

export const sendPlayerAction = async (data) => {
    const endpoint = `/player/action`;
    return await request(endpoint, 'POST', data);
}

/* EVENT */
export const getRandomEvent = async () => { 
    const endpoint = `/event/random`;
    return await request(endpoint);
}

/* USER */
export const updateUser = async (data) => {
    const endpoint = `/user`;
    return await request(endpoint, 'PUT', data);
}

export const duplicatedEmail = async (email) => {
    const endpoint = `/user/email-in-use/${email}`;
    return await request(endpoint);
}

export const getUser = async () => {
    const endpoint = `/user`;
    return await request(endpoint);
}

export const logout = async () => {
    const endpoint = "/user/logout";
    await request(endpoint, 'POST');
}

/* CONTACT FORM */
export const sendContactForm = async (data) => {
    const endpoint = "/email/contact";
    return await request(endpoint, 'POST', data);

}