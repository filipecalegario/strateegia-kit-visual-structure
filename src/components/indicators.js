export async function fetchMapsById(accessToken, mapId, apiFunction) {
    if (mapId?.length > 1) {

        const result = await Promise.all(
            mapId.map(({value}) => {
                return apiFunction(accessToken, value);
            })
        )
        return result;
    } else {

        const result = await apiFunction(accessToken, mapId[0]?.value);

        return result;
        
    }
};


