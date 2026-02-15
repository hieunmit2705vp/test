import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCXf3-khSubthq5LKJ-xVO1P7JaEqgD3_M",
  authDomain: "datn-anh-7449e.firebaseapp.com",
  projectId: "datn-anh-7449e",
  storageBucket: "datn-anh-7449e.firebasestorage.app",
  messagingSenderId: "917826628321",
  appId: "1:917826628321:web:f0212a7f99a9e473eee5a0",
  measurementId: "G-0E4Y0KR64T"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const UploadFileService = {
  uploadProductImage: async (file) => {
    try {
      const uniqueFileName = `Account/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, uniqueFileName);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      console.log(`Ảnh sản phẩm đã tải lên: ${downloadURL}`);
      return downloadURL;
    } catch (error) {
      console.error("Lỗi khi tải ảnh sản phẩm lên:", error);
      throw error;
    }
  },

  uploadEmployeeImage: async (file) => {
    try {
      const uniqueFileName = `Employees/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, uniqueFileName);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      console.log(`Ảnh sản phẩm đã tải lên: ${downloadURL}`);
      return downloadURL;
    } catch (error) {
      console.error("Lỗi khi tải ảnh sản phẩm lên:", error);
      throw error;
    }
  },
};

export default UploadFileService;
