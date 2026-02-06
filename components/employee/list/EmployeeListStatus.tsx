import { Alert, CircularProgress, Stack, Typography } from "@mui/material";

interface Props {
  loading: boolean;
  error?: string | null;
}
// <EmployeeLIstStatus data = {data}/>
const EmployeeListStatus = (data: Props) => {
  const {loading, error} = data
  
  if (loading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <CircularProgress size={18} />
        <Typography color="text.secondary">
          데이터를 불러오는 중입니다…
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return null;
};

export default EmployeeListStatus;