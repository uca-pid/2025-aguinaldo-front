import { createMachine, assign, fromPromise } from "xstate";
import { AuthService } from "../service/auth-service.service";
import { orchestrator } from "#/core/Orchestrator";
import type { ProfileResponse } from "../models/Auth";

export const PROFILE_MACHINE_ID = "profile";
export const PROFILE_MACHINE_EVENT_TYPES = [
  "SET_AUTH",
  "LOGOUT",
  "SAVE_PROFILE",
  "UPDATE_PROFILE", 
  "CANCEL_PROFILE_EDIT",
  "DEACTIVATE_ACCOUNT",
  "UPDATE_FORM",
  "CLEAR_ERROR"
];

export interface ProfileMachineContext {
  profile: ProfileResponse | null;
  updatingProfile: boolean;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  userId: string | null;
  formValues: {
    name: string;
    surname: string;
    email: string;
    phone: string;
    dni: string;
    gender: string;
    birthdate: string | null;
    specialty: string | null;
    medicalLicense: string | null;
    slotDurationMin: number | null;
  };
}

export const ProfileMachineDefaultContext: ProfileMachineContext = {
  profile: null,
  updatingProfile: false,
  loading: false,
  error: null,
  accessToken: null,
  userId: null,
  formValues: {
    name: "",
    surname: "",
    email: "",
    phone: "",
    dni: "",
    gender: "",
    birthdate: null,
    specialty: null,
    medicalLicense: null,
    slotDurationMin: null,
  },
};

export type ProfileMachineEvent =
  | { type: "SET_AUTH"; accessToken: string; userId: string }
  | { type: "LOGOUT" }
  | { type: "SAVE_PROFILE" }
  | { type: "UPDATE_PROFILE" }
  | { type: "CANCEL_PROFILE_EDIT"; key: string }
  | { type: "DEACTIVATE_ACCOUNT" }
  | { type: "UPDATE_FORM"; key: string; value: any }
  | { type: "CLEAR_ERROR" };

export const profileMachine = createMachine({
  id: "profile",
  initial: "idle",
  context: ProfileMachineDefaultContext,
  types: {
    context: {} as ProfileMachineContext,
    events: {} as ProfileMachineEvent,
  },
  states: {
    idle: {
      on: {
        SET_AUTH: {
          actions: assign({
            accessToken: ({ event }) => event.accessToken,
            userId: ({ event }) => event.userId,
          }),
        },
        LOGOUT: {
          actions: assign(() => ({
            ...ProfileMachineDefaultContext,
          })),
        },
        SAVE_PROFILE: {
          target: "savingProfile",
          guard: ({ context }) => !!context.accessToken && !!context.userId,
        },
        UPDATE_PROFILE: {
          target: "updatingProfile",
          guard: ({ context }) => !!context.accessToken && !!context.userId,
        },
        DEACTIVATE_ACCOUNT: {
          target: "deactivatingAccount",
          guard: ({ context }) => !!context.accessToken,
        },
        UPDATE_FORM: {
          actions: assign({
            formValues: ({ context, event }) => ({
              ...context.formValues,
              [event.key]: event.value,
            }),
          }),
        },
        CANCEL_PROFILE_EDIT: {
          actions: assign(({ context, event }) => {
            if (!context.profile) return {};
            return {
              formValues: {
                ...context.formValues,
                [event.key]: (context.profile as any)[event.key] || "",
              },
            };
          }),
        },
        CLEAR_ERROR: {
          actions: assign({
            error: null,
          }),
        },
      },
    },

    savingProfile: {
      entry: assign({
        loading: true,
        error: null,
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string; userId: string } }) => {
          const profile = await AuthService.getProfile(input.accessToken, input.userId);
          return profile;
        }),
        input: ({ context }) => ({
          accessToken: context.accessToken!,
          userId: context.userId!,
        }),
        onDone: {
          target: "idle",
          actions: assign({
            profile: ({ event }) => event.output,
            loading: false,
            formValues: ({ event }) => {
              const profile = event.output as ProfileResponse;
              return {
                name: profile.name || "",
                surname: profile.surname || "",
                email: profile.email || "",
                phone: profile.phone || "",
                dni: profile.dni || "",
                gender: profile.gender || "",
                birthdate: profile.birthdate || null,
                specialty: profile.specialty || null,
                medicalLicense: profile.medicalLicense || null,
                slotDurationMin: profile.slotDurationMin || null,
              };
            },
          }),
        },
        onError: {
          target: "idle",
          actions: assign({
            loading: false,
            error: ({ event }) =>
              event.error instanceof Error
                ? event.error.message
                : "Failed to fetch profile",
          }),
        },
      },
    },

    updatingProfile: {
      entry: assign({
        updatingProfile: true,
        error: null,
      }),
      invoke: {
        src: fromPromise(async ({ input }: { 
          input: { 
            accessToken: string; 
            userId: string; 
            formValues: ProfileMachineContext['formValues'] 
          } 
        }) => {
          // Build update data from formValues
          const updateData: any = {};
          
          Object.keys(input.formValues).forEach(key => {
            const value = input.formValues[key as keyof typeof input.formValues];
            if (value !== null && value !== undefined && value !== "") {
              updateData[key] = value;
            }
          });

          const updatedProfile = await AuthService.updateProfile(
            input.accessToken, 
            input.userId, 
            updateData
          );
          return updatedProfile;
        }),
        input: ({ context }) => ({
          accessToken: context.accessToken!,
          userId: context.userId!,
          formValues: context.formValues,
        }),
        onDone: {
          target: "idle",
          actions: assign({
            profile: ({ event }) => event.output,
            updatingProfile: false,
            formValues: ({ event }) => {
              const profile = event.output as ProfileResponse;
              return {
                name: profile.name || "",
                surname: profile.surname || "",
                email: profile.email || "",
                phone: profile.phone || "",
                dni: profile.dni || "",
                gender: profile.gender || "",
                birthdate: profile.birthdate || null,
                specialty: profile.specialty || null,
                medicalLicense: profile.medicalLicense || null,
                slotDurationMin: profile.slotDurationMin || null,
              };
            },
          }),
        },
        onError: {
          target: "idle",
          actions: assign({
            updatingProfile: false,
            error: ({ event }) =>
              event.error instanceof Error
                ? event.error.message
                : "Failed to update profile",
          }),
        },
      },
    },

    deactivatingAccount: {
      entry: assign({
        loading: true,
        error: null,
      }),
      invoke: {
        src: fromPromise(async ({ input }: { input: { accessToken: string } }) => {
          console.log('Starting account deactivation from profile machine...');
          await AuthService.deactivateAccount(input.accessToken);
          console.log('Account deactivation completed from profile machine');
          return { success: true };
        }),
        input: ({ context }) => ({
          accessToken: context.accessToken!,
        }),
        onDone: {
          target: "idle",
          actions: [
            assign(() => {
              console.log('Clearing profile state after deactivation...');
              return {
                ...ProfileMachineDefaultContext,
              };
            }),
            () => {
              // Notify other machines about logout
              orchestrator.send({ type: "LOGOUT" });
            }
          ],
        },
        onError: {
          target: "idle",
          actions: assign({
            loading: false,
            error: ({ event }) => (event.error as Error).message,
          }),
        },
      },
    },
  },
});