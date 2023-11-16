import { ref } from "vue";
import { useRouter } from "vue-router";
import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";

import { userConfirm, findById } from "@/api/member";
import { httpStatusCode } from "@/utils/http-status";

export const useMemberStore = defineStore("memberStore", () => {
  const router = useRouter();

  const isLogin = ref(false);
  const isLoginError = ref(false);
  const userInfo = ref(null);
  const isValidToken = ref(false);

  const userLogin = async (loginInfo) => {
    await userConfirm(
      loginInfo,
      (response) => {
        if (response.status === httpStatusCode.CREATE) {
          let { data } = response;

          let accessToken = data["access-token"];
          isLogin.value = true;
          isLoginError.value = false;
          isValidToken.value = true;
          sessionStorage.setItem("accessToken", accessToken);
        } else {
          console.log("로그인 실패했다");
          isLogin.value = false;
          isLoginError.value = true;
          isValidToken.value = false;
        }
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const getUserInfo = (token) => {
    let decodeToken = jwtDecode(token);
    console.log("2. decodeToken", decodeToken);
    console.log("2. decodeToken.userId", decodeToken.userId);
    findById(
      decodeToken.userId,
      (response) => {
        if (response.status === httpStatusCode.OK) {
          userInfo.value = response.data.userInfo;
          console.log("3. getUserInfo data >> ", response.data);
        } else {
          console.log("유저 정보 없음!!!!");
        }
      },
      async (error) => {
        console.error(
          "getUserInfo() error code [토큰 만료되어 사용 불가능.] ::: ",
          error.response.status
        );
        isValidToken.value = false;
      }
    );
  };

  // const userLogout = async (userid) => {
  //   await logout(
  //     userid,
  //     (response) => {
  //       if (response.status === httpStatusCode.OK) {
  //         isLogin.value = false;
  //         userInfo.value = null;
  //         isValidToken.value = false;
  //       } else {
  //         console.error("유저 정보 없음!!!!");
  //       }
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // };

  return {
    isLogin,
    isLoginError,
    userInfo,
    isValidToken,
    userLogin,
    getUserInfo,
    // tokenRegenerate,
    // userLogout,
  };
});
