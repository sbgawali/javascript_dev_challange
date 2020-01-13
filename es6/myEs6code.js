getUniqueNames = (dataStore) => [... new Set(dataStore.map((obj)=>obj.name))];
