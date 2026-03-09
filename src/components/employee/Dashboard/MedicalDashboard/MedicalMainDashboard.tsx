"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { patientActions } from "@/features/patients/patientSlice";
import type { PatientItem } from "@/features/employee/Dashboard/Dashboard.types";
import MedicalPatientPanel from "./MedicalPatientPanel";
import MedicalQuickMenu from "./MedicalQuickMenu";
import EmployeeCommonDashboard from "../employeeDashboard/EmployeeCommonDashboard";
import MedicalSummaryCards from "./MedicalStateCards";

const MedicalMainDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list } = useSelector((state: RootState) => state.patients);
  console.log( list);

  useEffect(() => {
    dispatch(patientActions.fetchPatientsRequest());
  }, [dispatch]);


  //환자 메인 상세정보 (겉화면 들어오면)
  const patients: PatientItem[] = list.map((item) => ({
    patientId: item.patientId,             //환자아이디
    patientName: item.name,                //환자 이름
    phone : item.phone,                    //환자 전화번호
    status: item.statusCode ?? undefined,  //환자 상태 //스트롱..

  }));

  const State = {
    total:    patients.length,                                           //전체환자

    waiting:  patients.filter((p) => p.status ===  "WAITING").length,    //대기환자
                                                  //웨이팅
    treating: patients.filter((p) => p.status === "TREATING").length,    //진료중
                                                  //트리링
    done:     patients.filter((p) => p.status ===     "DONE").length,    //완료
                                                  //던
  };



  return (
    <div>

      //환자 상태  (타입 "WAITING" / "TREATING"/ "DONE")
      <MedicalSummaryCards State={State} />

      //환자 상세 목록
      <MedicalPatientPanel patients={patients} />

      //업무 목록
      <MedicalQuickMenu />

      //직원 업무
      <EmployeeCommonDashboard/>
    </div>





  );
};

export default MedicalMainDashboard;




//   patientId: number;
//   patientNo?: string | null;
//   name: string;
//   gender?: "M" | "F" | string | null;
//   birthDate?: string | null;
//   phone?: string | null;

//  gender?: "M" | "F" | string | null;
//   birthDate?: string | null;
//   phone?: string | null;
//   email?: string | null;
//   address?: string | null;
//   addressDetail?: string | null;

//   guardianName?: string | null;
//   guardianPhone?: string | null;
//   guardianRelation?: string | null;
//   isForeigner?: boolean | null;
//   contactPriority?: ContactPriority | null;
//   note?: string | null;

//   isVip?: boolean | null;
//   photoUrl?: string | null;
//   statusCode?: string | null;
// }

