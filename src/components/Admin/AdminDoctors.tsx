import { useMemo } from 'react';
import { Box, Typography, Avatar, CircularProgress, Alert } from '@mui/material';
import PeopleIcon from "@mui/icons-material/People";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import RateReviewIcon from "@mui/icons-material/RateReview";
import { useMachines } from '#/providers/MachineProvider';
import { useDataMachine } from '#/providers/DataProvider';
import RatingsTable, { type RatingData } from '../shared/RatingsTable';
import StatsCards, { type StatCardData } from '../shared/StatsCards';
import SpecialtyDistribution, { type SpecialtyData } from '../shared/SpecialtyDistribution';
import '../shared/SharedStyles.css';
import "./AdminDashboard.css";
import "./AdminDoctors.css";

interface Doctor {
  id: string;
  name: string;
}

export default function AdminDoctors() {
  const { adminUserState, adminUserSend } = useMachines();
  const { dataState } = useDataMachine();
  const adminContext = adminUserState.context;
  const dataContext = dataState.context;

  const selectedDoctorId = adminContext.selectedFilterDoctorId;
  
  const handleFilterChange = (doctorId: string) => {
    adminUserSend({ type: 'SELECT_FILTER_DOCTOR', doctorId });
  };

  const allDoctors = dataContext.doctors || [];
  const totalRegisteredDoctors = allDoctors.length;

  const loading = adminContext.loading || 
                  dataContext.loading?.adminRatings || 
                  dataContext.loading?.adminStats ||
                  dataContext.loading?.doctors;

  const error = adminContext.error || dataContext.errors?.adminRatings;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const doctorStats = useMemo(() => {
    const adminRatings = adminContext.adminRatings || dataContext.adminRatings;
    const patientRatings = adminRatings?.patientRatings || []; // Patients rating doctors
    
    const filteredRatings = selectedDoctorId === 'all' 
      ? patientRatings 
      : patientRatings.filter((rating: any) => rating.ratedId === selectedDoctorId);
    
    const totalDoctors = adminContext.adminStats?.doctors || 0;
    const totalRatingsToDoctors = filteredRatings.length;
    
    const averageRatingReceived = filteredRatings.length > 0 
      ? (filteredRatings.reduce((sum: number, rating: any) => sum + rating.score, 0) / filteredRatings.length).toFixed(1)
      : '0.0';
    
    const doctorsRated = selectedDoctorId === 'all'
      ? new Set(patientRatings.map((rating: any) => rating.ratedId)).size
      : filteredRatings.length > 0 ? 1 : 0;
    const ratingCoverage = selectedDoctorId === 'all' && totalDoctors > 0 
      ? ((doctorsRated / totalDoctors) * 100).toFixed(1)
      : filteredRatings.length > 0 ? '100.0' : '0.0';

    return {
      totalDoctors: selectedDoctorId === 'all' ? totalDoctors : 1,
      totalRatingsToDoctors,
      averageRatingReceived,
      ratingCoverage,
      doctorsRated
    };
  }, [adminContext.adminRatings, dataContext.adminRatings, adminContext.adminStats, selectedDoctorId]);

  const doctorsList = useMemo(() => {
    const adminRatings = adminContext.adminRatings || dataContext.adminRatings;
    const patientRatings = adminRatings?.patientRatings || [];
    
    const uniqueDoctors: Doctor[] = patientRatings.reduce((acc: Doctor[], rating: any) => {
      const existing = acc.find(d => d.id === rating.ratedId);
      if (!existing) {
        acc.push({
          id: rating.ratedId,
          name: rating.ratedName
        });
      }
      return acc;
    }, []);
    
    return uniqueDoctors.sort((a: Doctor, b: Doctor) => a.name.localeCompare(b.name));
  }, [adminContext.adminRatings, dataContext.adminRatings]);

  const ratingsData: RatingData[] = useMemo(() => {
    const adminRatings = adminContext.adminRatings || dataContext.adminRatings;
    const patientRatings = adminRatings?.patientRatings || []; // Patients rating doctors
    
    const filteredRatings = selectedDoctorId === 'all' 
      ? patientRatings 
      : patientRatings.filter((rating: any) => rating.ratedId === selectedDoctorId);
    
    return filteredRatings.map((rating: any) => ({
      id: rating.id,
      patientName: rating.raterName, 
      doctorName: rating.ratedName, 
      doctorSpecialty: rating.doctorSpecialty,
      score: rating.score,
      subcategories: rating.subcategories || [],
      createdAt: formatDate(rating.createdAt)
    }));
  }, [adminContext.adminRatings, dataContext.adminRatings, selectedDoctorId]);

  const specialtyDistribution: SpecialtyData[] = useMemo(() => {
    const specialtyCounts: { [key: string]: number } = {};
    
    allDoctors.forEach((doctor: any) => {
      if (doctor.specialty) {
        specialtyCounts[doctor.specialty] = (specialtyCounts[doctor.specialty] || 0) + 1;
      }
    });

    return Object.entries(specialtyCounts)
      .map(([specialty, count]) => ({
        specialty,
        count,
        percentage: totalRegisteredDoctors > 0 ? (count / totalRegisteredDoctors) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [allDoctors, totalRegisteredDoctors]);

  const statsData: StatCardData[] = useMemo(() => [
    {
      icon: <PeopleIcon />,
      value: doctorStats.totalDoctors,
      label: "Doctores Activos"
    },
    {
      icon: <RateReviewIcon />,
      value: doctorStats.totalRatingsToDoctors,
      label: "Total Evaluaciones"
    },
    {
      icon: <StarIcon />,
      value: doctorStats.averageRatingReceived,
      label: "Calificación Promedio"
    },
    {
      icon: <TrendingUpIcon />,
      value: `${doctorStats.ratingCoverage}%`,
      label: "Doctores Evaluados"
    }
  ], [doctorStats]);

  return (
    <Box className="shared-container">
      {/* Header Section */}
      <Box className="shared-header">
        <Box className="shared-header-layout">
          <Box className="shared-header-content">
            <Avatar className="shared-header-icon">
              <PeopleIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" className="shared-header-title">
                Gestión de Doctores
              </Typography>
              <Typography variant="h6" className="shared-header-subtitle">
                Panel administrativo para revisión de doctores
              </Typography>
            </Box>
          </Box>
          <Box className="shared-header-spacer">
            {loading && <CircularProgress />}
          </Box>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar los datos: {error}
        </Alert>
      )}

      <Box className="doctors-content">
        {/* Statistics Cards */}
        <StatsCards stats={statsData} loading={loading} />

        {/* Specialty Distribution */}
        <SpecialtyDistribution
          specialties={specialtyDistribution}
          totalDoctors={doctorStats.totalDoctors}
          loading={loading}
          title="Distribución por Especialidades"
          subtitle="Distribución de todos los doctores registrados por especialidad médica"
        />

        {/* Ratings Section */}
        <RatingsTable
          ratingsData={ratingsData}
          title="Evaluaciones de Pacientes a Doctores"
          subtitle="Historial completo de todas las evaluaciones realizadas por pacientes a doctores"
          loading={loading}
          emptyMessage={{
            title: "No hay evaluaciones disponibles",
            subtitle: "Los pacientes aún no han realizado evaluaciones a los doctores"
          }}
          filterConfig={{
            filterType: 'doctor',
            filterOptions: doctorsList,
            selectedFilterId: selectedDoctorId,
            onFilterChange: handleFilterChange,
            getFilteredTitle: (selectedName) => 
              selectedName 
                ? `Evaluaciones de Pacientes a ${selectedName}`
                : "Evaluaciones de Pacientes a Doctores",
            getFilteredSubtitle: (selectedName) =>
              selectedName
                ? "Evaluaciones específicas para el doctor seleccionado"
                : "Historial completo de todas las evaluaciones realizadas por pacientes a doctores",
            getFilteredEmptyMessage: (selectedName) => ({
              title: selectedName 
                ? "No hay evaluaciones para este doctor"
                : "No hay evaluaciones disponibles",
              subtitle: selectedName
                ? "Este doctor aún no ha recibido evaluaciones de pacientes"
                : "Los pacientes aún no han realizado evaluaciones a los doctores"
            })
          }}
        />
      </Box>
    </Box>
  );
}