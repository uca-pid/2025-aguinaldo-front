import React from "react";
import { Box,Button,Card,CardContent,Dialog,DialogTitle,DialogContent,Typography,TextField,IconButton,Switch,Grid,styled} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useMachines } from "../../../../../providers/MachineProvider";

const RangeRow = motion(styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  alignItems: "center",
  marginBottom: theme.spacing(0.5),
})));

const WeeklyAvailability: React.FC = () => {
  const { ui, turn } = useMachines();
  const { context: uiContext, send: uiSend } = ui;
  const { context: turnContext, send: turnSend } = turn;

  const showWeeklyAvailability = uiContext.toggleStates?.["enableDoctorReservations"] ?? false;
  const availability = turnContext.availability || [];

  const saveAvailability = () => {
    turnSend({ type: "SAVE_AVAILABILITY" });
    uiSend({ type: "TOGGLE", key: "enableDoctorReservations" });
  };

  return (
    <Dialog
      open={showWeeklyAvailability}
      onClose={() => uiSend({ type: "TOGGLE", key: "enableDoctorReservations" })}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          backgroundColor: "#fafafa",
          p: { xs: 1.5, sm: 2 },
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle textAlign="center" fontWeight="bold">
        Configurá tu disponibilidad semanal
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: "70vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Grid container spacing={1}>
          {availability.map((day, dayIndex) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.03, y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.12)" }}
              transition={{ duration: 0.25, delay: dayIndex * 0.05 }}
              style={{ width: "100%" }}
            >
              <Card variant="outlined" sx={{ borderRadius: 2, p: 1, boxShadow: 1 }}>
                <CardContent sx={{ p: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      {day.day}
                    </Typography>
                    <Switch
                      checked={day.enabled}
                      onChange={() => turnSend({ type: "TOGGLE_DAY", index: dayIndex })}
                      color="success"
                      size="medium"
                    />
                  </Box>

                  <AnimatePresence>
                    {day.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {day.ranges.map((range, rangeIndex) => (
                          <RangeRow
                            key={rangeIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TextField
                              type="time"
                              size="small"
                              value={range.start}
                              onChange={(e) =>
                                turnSend({
                                  type: "UPDATE_RANGE",
                                  dayIndex,
                                  rangeIndex,
                                  field: "start",
                                  value: e.target.value,
                                })
                              }
                              sx={{ width: 80 }}
                            />
                            <TextField
                              type="time"
                              size="small"
                              value={range.end}
                              onChange={(e) =>
                                turnSend({
                                  type: "UPDATE_RANGE",
                                  dayIndex,
                                  rangeIndex,
                                  field: "end",
                                  value: e.target.value,
                                })
                              }
                              sx={{ width: 80 }}
                            />
                            <IconButton
                              onClick={() =>
                                turnSend({ type: "REMOVE_RANGE", dayIndex, rangeIndex })
                              }
                              size="small"
                              sx={{
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.2)" },
                              }}
                            >
                              <Delete color="error" fontSize="small" />
                            </IconButton>
                          </RangeRow>
                        ))}

                        <Button
                          startIcon={<Add />}
                          onClick={() => turnSend({ type: "ADD_RANGE", dayIndex })}
                          sx={{
                            alignSelf: "flex-start",
                            fontSize: "0.75rem",
                            py: 0.5,
                            px: 1,
                            mt: 0.5,
                            transition: "transform 0.2s",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                          size="small"
                        >
                          Agregar rango
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Grid>

        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="contained"
            color="success"
            onClick={saveAvailability}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 0.8,
              fontSize: "0.85rem",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.03)" },
            }}
          >
            Guardar disponibilidad
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyAvailability;
