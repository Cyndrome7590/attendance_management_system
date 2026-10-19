export function getCurrentLocation() {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }

    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const safetyTimer = setTimeout(() => settle(null), 6000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(safetyTimer);
        settle({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        clearTimeout(safetyTimer);
        settle(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}
