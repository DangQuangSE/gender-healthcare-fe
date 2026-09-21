import axios from "axios";
import { CLOUDINARY_UPLOAD_URL } from "../config/env";

const uploadClient = axios.create({
  baseURL: CLOUDINARY_UPLOAD_URL || undefined,
  timeout: 30000,
});

export default uploadClient;
