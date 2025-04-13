// import axios from "axios";
import Swal from 'sweetalert2';



const userData = JSON.parse(localStorage.getItem("userDataStore"));
// let counter = 1000;

export function getSessionTimeout() {
  let first_distance_passed = 0;
  try {


    if (userData) {

      let x = setInterval(function () {
        const currentUser_new = JSON.parse(localStorage.getItem("userDataStore"));
        let now = new Date().getTime();
        let distance = new Date(currentUser_new?.timeLogout).getTime() - now;
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // console.log( " <> ", currentUser_new?.counter);
        // console.log(distance, " <> ", seconds);

        if (distance < 9742) {

          if (first_distance_passed === 0) {
            first_distance_passed = first_distance_passed + 1;

            let timerInterval;
            Swal.fire({
              html: `Session Expiring Soon! Signing you out in <b>${seconds || 0}</b> seconds.`,
              timer: seconds * 1000, // Set the timer in milliseconds
              showConfirmButton: false,
              allowOutsideClick: true,
              showConfirmButton: true,
              confirmButtonText: 'Extend Session',
              confirmButtonColor: 'red',
              didOpen: (openTracker) => {
                // Update the timer every second
                timerInterval = setInterval(() => {
                  const htmlContainer = Swal.getHtmlContainer();
                  if (htmlContainer) {
                      const remainingSeconds = Math.ceil(Swal.getTimerLeft() / 1000);
                      remainingSeconds > 0 ? htmlContainer.innerHTML = `Session Expiring Soon! Signing you out in <b>${remainingSeconds}</b> seconds.` : '';                      
                  }
                }, 1000);
              },
              willClose: () => {
                clearInterval(timerInterval);
              },
            }).then((result) => {
              // console.log('Session expired. Redirecting to login...', result);
              if (result.isConfirmed || result.dismiss === Swal.DismissReason.backdrop) {
                currentUser_new["timeLogout"] = new Date().getTime() + currentUser_new?.sessiomTime;
                localStorage.setItem('userDataStore', JSON.stringify(currentUser_new))
                
                first_distance_passed = 0;
              }
              else {
                // localStorage.clear()
                // window.location.href = '/auth/sign-in';
                // console.log('Session.', result);

              }
            });
          }
        }
        if (distance < 1) {
          clearInterval(x);

          // localStorage.removeItem("userDataStore")
          localStorage.clear()
          setTimeout(function () {
            window.location.href = '/auth/sign-in';
            window.location.reload()
          }, 100);
        }
      }, 1000);
    }
  } catch (error) {
    // console.log(error)
  }



}