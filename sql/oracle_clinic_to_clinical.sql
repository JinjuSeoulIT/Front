-- ============================================================
-- 1단계: 확인 (현재 CLINIC 관련 객체가 있는지 조회)
-- ============================================================

-- 1-1. CLINIC 관련 테이블 존재 여부
SELECT table_name FROM user_tables WHERE table_name = 'CLINIC';

-- 1-2. CLINIC_ID 컬럼을 가진 테이블
SELECT table_name, column_name
  FROM user_tab_columns
 WHERE column_name LIKE '%CLINIC%'
 ORDER BY table_name, column_name;

-- 1-3. CLINIC 관련 제약조건
SELECT constraint_name, table_name, constraint_type
  FROM user_constraints
 WHERE constraint_name LIKE '%CLINIC%'
    OR (constraint_type = 'R' AND constraint_name IN (
          SELECT constraint_name FROM user_cons_columns WHERE column_name = 'CLINIC_ID'
       ))
 ORDER BY table_name;

-- 1-4. CLINIC 관련 시퀀스
SELECT sequence_name FROM user_sequences WHERE sequence_name LIKE '%CLINIC%';


-- ============================================================
-- 2단계: 수정 실행 (1단계 확인 후, 백업 후 실행)
-- ============================================================

-- 2-1. CLINIC을 참조하는 FK 제거 (실제 제약명이 다르면 아래 조회로 확인 후 DROP)
--      조회: CLINIC을 참조하는 FK 목록
SELECT c.constraint_name, c.table_name
  FROM user_constraints c
  JOIN user_constraints p ON c.r_constraint_name = p.constraint_name
 WHERE p.table_name = 'CLINIC' AND c.constraint_type = 'R'
 ORDER BY c.table_name;
--      위 결과의 constraint_name으로 아래처럼 DROP (이름이 다르면 결과에 맞게 수정)
-- ALTER TABLE DOCTOR_NOTE DROP CONSTRAINT <실제_제약명>;
-- ALTER TABLE DIAGNOSIS DROP CONSTRAINT <실제_제약명>;
-- ALTER TABLE ORDERS DROP CONSTRAINT <실제_제약명>;

-- 2-2. 테이블 이름 변경
RENAME CLINIC TO CLINICAL;

-- 2-3. CLINICAL 테이블 컬럼명 변경
ALTER TABLE CLINICAL RENAME COLUMN CLINIC_ID TO CLINICAL_ID;
ALTER TABLE CLINICAL RENAME COLUMN CLINIC_TYPE TO CLINICAL_TYPE;
ALTER TABLE CLINICAL RENAME COLUMN CLINIC_STATUS TO CLINICAL_STATUS;
ALTER TABLE CLINICAL RENAME COLUMN CLINIC_AT TO CLINICAL_AT;

-- 2-4. CLINICAL PK 제약명 변경
ALTER TABLE CLINICAL RENAME CONSTRAINT PK_CLINIC TO PK_CLINICAL;

-- 2-5. 자식 테이블 컬럼명 변경 + FK 재생성
ALTER TABLE DOCTOR_NOTE RENAME COLUMN CLINIC_ID TO CLINICAL_ID;
ALTER TABLE DOCTOR_NOTE ADD CONSTRAINT FK_DOCTOR_NOTE_CLINICAL
  FOREIGN KEY (CLINICAL_ID) REFERENCES CLINICAL (CLINICAL_ID);

ALTER TABLE DIAGNOSIS RENAME COLUMN CLINIC_ID TO CLINICAL_ID;
ALTER TABLE DIAGNOSIS ADD CONSTRAINT FK_DIAGNOSIS_CLINICAL
  FOREIGN KEY (CLINICAL_ID) REFERENCES CLINICAL (CLINICAL_ID);

ALTER TABLE ORDERS RENAME COLUMN CLINIC_ID TO CLINICAL_ID;
ALTER TABLE ORDERS ADD CONSTRAINT FK_ORDERS_CLINICAL
  FOREIGN KEY (CLINICAL_ID) REFERENCES CLINICAL (CLINICAL_ID);

-- 2-6. 시퀀스: CLINIC 제거 후 clinical 하나만 유지
RENAME SEQ_CLINIC TO SEQ_CLINICAL;

-- 2-7. (선택) 시퀀스 하나만 쓰려면: SEQ_HOSPITAL_CLINICAL이 다른 테이블/트리거에서
--       사용 중이 아닌지 확인한 뒤, 사용 안 하면 아래 실행해서 SEQ_CLINICAL만 남김
-- DROP SEQUENCE SEQ_HOSPITAL_CLINICAL;


-- ============================================================
-- 3단계: 수정 후 확인 (CLINIC 없고 CLINICAL만 있는지)
-- ============================================================

SELECT table_name FROM user_tables WHERE table_name IN ('CLINIC', 'CLINICAL');
SELECT table_name, column_name FROM user_tab_columns WHERE column_name LIKE '%CLINICAL%' ORDER BY 1, 2;
SELECT sequence_name FROM user_sequences WHERE sequence_name LIKE '%CLINICAL%';

-- 아래는 0건이어야 함 (clinic 잔여 없음)
-- SELECT table_name FROM user_tables WHERE table_name LIKE '%CLINIC%' AND table_name NOT LIKE '%CLINICAL%';
-- SELECT sequence_name FROM user_sequences WHERE sequence_name = 'SEQ_CLINIC';
