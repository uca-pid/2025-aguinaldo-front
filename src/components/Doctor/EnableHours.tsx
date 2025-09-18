import React, { useCallback } from "react";
import { 
  Avatar, 
  Box, 
  Button, 
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  Alert,
  IconButton
} from "@mui/material"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { 
  CalendarMonthOutlined, 
  ArrowBack,
  CheckCircle,
  Add,
  Delete
} from '@mui/icons-material'
import { motion, AnimatePresence } from "framer-motion"
import { useMachines } from "#/providers/MachineProvider"
import './EnableHours.css'

const RangeRow = motion(Box);

const EnableHours: React.FC = () => {
    const { ui, turn } = useMachines();
    const { send: uiSend } = ui;
    const { context: turnContext, send: turnSend } = turn;

    const availability = turnContext.availability || [];
    const enabledDays = availability.filter(day => day.enabled).length;
    const totalRanges = availability.reduce((total, day) => total + (day.enabled ? day.ranges.length : 0), 0);

    const handleBack = () => {
        uiSend({ type: "NAVIGATE", to: "/dashboard" });
    };

    const saveAvailability = () => {
        turnSend({ type: "SAVE_AVAILABILITY" });
        // Optionally navigate back or show success message
    };

    const handleToggleDay = useCallback((dayIndex: number) => {
        turnSend({ type: "TOGGLE_DAY", index: dayIndex });
    }, [turnSend]);

    const handleAddRange = useCallback((dayIndex: number) => {
        turnSend({ type: "ADD_RANGE", dayIndex });
    }, [turnSend]);

    const handleRemoveRange = useCallback((dayIndex: number, rangeIndex: number) => {
        turnSend({ type: "REMOVE_RANGE", dayIndex, rangeIndex });
    }, [turnSend]);

    const handleUpdateRange = useCallback((dayIndex: number, rangeIndex: number, field: "start" | "end", value: string) => {
        turnSend({
            type: "UPDATE_RANGE",
            dayIndex,
            rangeIndex,
            field,
            value,
        });
    }, [turnSend]);
    
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box className="enablehours-container">
                <Box className="enablehours-header">
                    <Box className="enablehours-header-layout">
                        <Box className="enablehours-back-button-container">
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={handleBack}
                                className="enablehours-back-button"
                                variant="outlined"
                            >
                                Volver al Dashboard
                            </Button>
                        </Box>
                        
                        <Box className="enablehours-header-content">
                            <Avatar className="enablehours-header-icon">
                                <CalendarMonthOutlined className="enablehours-calendar-icon" />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" component="h1" className="enablehours-header-title">
                                    Configurar Horarios
                                </Typography>
                                <Typography variant="h6" className="enablehours-header-subtitle">
                                    Establece tus días y horarios de atención 
                                </Typography>
                            </Box>
                        </Box>
                        <Box className="enablehours-header-spacer"></Box>
                    </Box>
                </Box>

                <Box className="enablehours-content">
                    {/* Days Configuration */}
                    <Box className="enablehours-days-container">
                        {availability.map((day, dayIndex) => (
                            <Box key={day.day} className="enablehours-day-container">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    transition={{ duration: 0.25, delay: dayIndex * 0.05 }}
                                >
                                    <Card 
                                        variant="outlined" 
                                        className={`enablehours-day-card enablehours-day-card-styled ${day.enabled ? 'enabled' : 'disabled'}`}
                                    >
                                        <CardContent>
                                            {/* Day Header */}
                                            <Box className="enablehours-day-header">
                                                <Box className="enablehours-day-info">
                                                    <Box className="enablehours-day-details">
                                                        <Typography variant="h6" className="enablehours-day-title">
                                                            {day.day}
                                                        </Typography>
                                                        <Typography variant="caption" className="enablehours-day-status">
                                                            {day.enabled ? `Activo - ${day.ranges.length} horario(s)` : 'Inactivo'}
                                                        </Typography>
                                                    </Box>
                                                    {day.enabled && day.ranges.length > 0 && (
                                                        <Box className="enablehours-ranges-preview">
                                                            {day.ranges.map((range, idx) => (
                                                                <Typography key={idx} variant="body2" color="text.secondary">
                                                                    {range.start && range.end ? `${range.start} - ${range.end}` : 'Sin configurar'}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Switch
                                                    checked={day.enabled}
                                                    onChange={() => handleToggleDay(dayIndex)}
                                                    size="medium"
                                                    className="enablehours-switch"
                                                />
                                            </Box>

                                            {/* Time Range */}
                                            <AnimatePresence>
                                                {day.enabled && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="enablehours-time-section"
                                                    >
                                                        <Box className="enablehours-time-box">
                                                            {day.ranges.length === 0 ? (
                                                                <Box textAlign="center" py={2}>
                                                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                                                        No hay horarios configurados
                                                                    </Typography>
                                                                    <Button
                                                                        startIcon={<Add />}
                                                                        onClick={() => handleAddRange(dayIndex)}
                                                                        variant="contained"
                                                                        size="small"
                                                                        color="success"
                                                                        className="enablehours-add-first-button"
                                                                    >
                                                                        Agregar primer horario
                                                                    </Button>
                                                                </Box>
                                                            ) : (
                                                                <>
                                                                    {day.ranges.map((range, rangeIndex) => (
                                                                        <RangeRow
                                                                            key={rangeIndex}
                                                                            initial={{ opacity: 0, x: -10 }}
                                                                            animate={{ opacity: 1, x: 0 }}
                                                                            exit={{ opacity: 0, x: 10 }}
                                                                            transition={{ duration: 0.2 }}
                                                                            className="enablehours-range-row"
                                                                        >
                                                                            <TextField
                                                                                type="time"
                                                                                size="small"
                                                                                label="Inicio"
                                                                                value={range.start || ""}
                                                                                onChange={(e) => handleUpdateRange(dayIndex, rangeIndex, "start", e.target.value)}
                                                                                InputLabelProps={{
                                                                                    shrink: true,
                                                                                }}
                                                                                className="enablehours-time-input"
                                                                            />
                                                                            <TextField
                                                                                type="time"
                                                                                size="small"
                                                                                label="Fin"
                                                                                value={range.end || ""}
                                                                                onChange={(e) => handleUpdateRange(dayIndex, rangeIndex, "end", e.target.value)}
                                                                                InputLabelProps={{
                                                                                    shrink: true,
                                                                                }}
                                                                                className="enablehours-time-input"
                                                                            />
                                                                            <IconButton
                                                                                onClick={() => handleRemoveRange(dayIndex, rangeIndex)}
                                                                                size="small"
                                                                                className="enablehours-delete-button"
                                                                            >
                                                                                <Delete color="error" fontSize="small" />
                                                                            </IconButton>
                                                                        </RangeRow>
                                                                    ))}

                                                                    <Button
                                                                        startIcon={<Add />}
                                                                        onClick={() => handleAddRange(dayIndex)}
                                                                        variant="outlined"
                                                                        size="small"
                                                                        fullWidth
                                                                        className="enablehours-add-range-button"
                                                                    >
                                                                        Agregar otro horario
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </Box>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Box>
                        ))}
                    </Box>

                    {(enabledDays === 0 || totalRanges === 0) && (
                        <Alert severity="warning" className="enablehours-warning">
                            ⚠️ Debes activar al menos un día y configurar horarios para poder guardar tu disponibilidad.
                        </Alert>
                    )}

                    {/* Save Button */}
                    <Box className="enablehours-actions">
                        <Button
                            variant="contained"
                            color="success"
                            onClick={saveAvailability}
                            size="large"
                            startIcon={<CheckCircle />}
                            disabled={enabledDays === 0 || totalRanges === 0}
                            className="enablehours-save-button"
                        >
                            Guardar Disponibilidad
                        </Button>
                    </Box>

                    
                </Box>
            </Box>
        </LocalizationProvider>
    )
}

export default EnableHours