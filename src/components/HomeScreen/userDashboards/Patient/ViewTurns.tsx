import { 
  Box, Button, ListItem, ListItemText, Modal, Typography, CircularProgress, 
  Alert, Chip, FormControl, InputLabel, Select, MenuItem 
} from "@mui/material";
import { useMachines } from "#/providers/MachineProvider";
import { useAuthMachine } from "#/providers/AuthProvider";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { DateCalendar } from "@mui/x-date-pickers";
import { useEffect } from "react";
import dayjs from "dayjs";
import { SignInResponse } from "#/models/Auth";

const ViewTurns: React.FC = () => {
  const { ui, turn } = useMachines();
  const { auth } = useAuthMachine();
  const { context: uiContext, send: uiSend } = ui;
  const { context: authContext, authResponse: authResponse } = auth;
  const user = authResponse as SignInResponse
  const { state: turnState, send: turnSend } = turn;
  
  const formContext = uiContext.toggleStates || {};
  const reservations = formContext["reservations"] ?? false;
  const turnContext = turnState.context;
  const showTurnsContext = turnContext.showTurns;

  useEffect(() => {
    if (reservations && authContext.isAuthenticated && user.accessToken) {
      turnSend({
        type: "SET_AUTH",
        accessToken: user.accessToken,
        userId: user.id || ""
      });
      turnSend({ type: "LOAD_MY_TURNS" });
    }
  }, [reservations, authContext.isAuthenticated, user.accessToken, turnSend]);

  const filteredTurns = turnContext.myTurns.filter((turn: any) => {
    let matchesDate = true;
    let matchesStatus = true;

    if (showTurnsContext.dateSelected) {
      const turnDate = dayjs(turn.scheduledAt).format("DD/MM/YYYY");
      const selectedDate = showTurnsContext.dateSelected.format("DD/MM/YYYY");
      matchesDate = turnDate === selectedDate;
    }

    if (showTurnsContext.statusFilter) {
      matchesStatus = turn.status === showTurnsContext.statusFilter;
    }

    return matchesDate && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'AVAILABLE':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'Reservado';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'AVAILABLE':
        return 'Disponible';
      default:
        return status;
    }
  };

  const handleClose = () => {
    uiSend({ type: "TOGGLE", key: "reservations" });
    turnSend({ type: "RESET_SHOW_TURNS" });
  };

  return (
    <>
      <Modal open={reservations} onClose={handleClose}>
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 8,
            p: { xs: 1.5, sm: 3 },
            minWidth: { xs: "90vw", sm: 400 },
            width: { xs: "95vw", sm: 500 },
            maxWidth: "98vw",
            maxHeight: { xs: "95vh", sm: "90vh" },
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" mb={1}>
            Mis Turnos
          </Typography>

          {turnContext.myTurnsError && (
            <Alert severity="error">
              Error al cargar turnos: {turnContext.myTurnsError}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={showTurnsContext.statusFilter}
                  label="Estado"
                  onChange={(e) => turnSend({
                    type: "UPDATE_FORM_SHOW_TURNS",
                    key: "statusFilter",
                    value: e.target.value
                  })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="RESERVED">Reservados</MenuItem>
                  <MenuItem value="COMPLETED">Completados</MenuItem>
                  <MenuItem value="CANCELLED">Cancelados</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <DemoContainer components={['DateCalendar']}>
                <DemoItem label="Filtrar por fecha (opcional)">
                  <DateCalendar
                    value={showTurnsContext.dateSelected}
                    onChange={(e) => {
                      turnSend({
                        type: "UPDATE_FORM_SHOW_TURNS",
                        key: "dateSelected",
                        value: e
                      });
                    }}
                  />
                </DemoItem>
              </DemoContainer>
            </Box>

            {(showTurnsContext.dateSelected || showTurnsContext.statusFilter) && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => turnSend({ type: "RESET_SHOW_TURNS" })}
                sx={{ alignSelf: 'flex-start' }}
              >
                Limpiar filtros
              </Button>
            )}
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={1}>
            <Button onClick={handleClose} color="inherit">
              Cerrar
            </Button>
          </Box>

          <Box mt={2}>
            <Typography variant="h6" mb={1}>
              {showTurnsContext.dateSelected 
                ? `Turnos del ${showTurnsContext.dateSelected.format("DD/MM/YYYY")}`
                : 'Todos mis turnos'
              }
              {showTurnsContext.statusFilter && ` - ${getStatusLabel(showTurnsContext.statusFilter)}`}
            </Typography>

            {turnContext.isLoadingMyTurns ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress size={24} />
                <Typography ml={2}>Cargando turnos...</Typography>
              </Box>
            ) : filteredTurns.length > 0 ? (
              <Box>
                {filteredTurns.map((turn: any, index: number) => (
                  <ListItem key={turn.id || index} divider sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" component="span">
                            {dayjs(turn.scheduledAt).format("DD/MM/YYYY - HH:mm")}
                          </Typography>
                          <Chip
                            label={getStatusLabel(turn.status)}
                            color={getStatusColor(turn.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" component="span" display="block">
                            Dr. {turn.doctorName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" component="span" display="block">
                            {turn.doctorSpecialty}
                          </Typography>
                        </Box>
                      }
                    />
                    {turn.status === 'RESERVED' && (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => {
                          // TODO: Implement cancel turn functionality
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </ListItem>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" p={2}>
                {showTurnsContext.dateSelected || showTurnsContext.statusFilter
                  ? 'No hay turnos que coincidan con los filtros seleccionados'
                  : 'No tenés turnos registrados'
                }
              </Typography>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
}

export default ViewTurns;