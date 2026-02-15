import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = { 
  apiKey : "AIzaSyCXf3-khSubthq5LKJ-xVO1P7JaEqgD3_M" , 
  authDomain : "datn-anh-7449e.firebaseapp.com" , 
  projectId : "datn-anh-7449e" , 
  storageBucket : "datn-anh-7449e.firebasestorage.app" , 
  messagingSenderId : "917826628321" , 
  appId : "1:917826628321:web:f0212a7f99a9e473eee5a0" , 
  measurementId : "G-0E4Y0KR64T" 
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
