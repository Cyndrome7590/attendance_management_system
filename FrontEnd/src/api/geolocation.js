
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Your browser does not support location services."));
      return;
    }

    if (!window.isSecureContext) {
      reject(
        new Error("Location requires HTTPS. Open the deployed website using its HTTPS address.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = "Unable to get your location. Please try again.";

        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission is denied. Allow location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your location is unavailable. Check your device location settings.";
        } else if (error.code === error.TIMEOUT) {
          message = "Getting your location took too long. Please try again.";
        }

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}
