export interface Role {
  id: number
  nombre: string
  descripcion: string
  createdAt: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string
}

export interface Configuracion {
  id: number
  clave: string
  valor: string
  updatedAt: string
}

export interface Guest {
  id: number
  nombre: string
  apellido: string
  tipoDocumento: string
  documento: string
  email: string
  telefono: string
  profesion: string
  nacionalidad: string
  fechaNacimiento: string | null
  direccion: string
  createdAt: string
  updatedAt: string
}

export interface RoomType {
  id: number
  nombre: string
  descripcion: string
  precioBase: number
  capacidadMaxima: number
}

export interface Room {
  id: number
  numero: string
  roomTypeId: number
  precioPersonalizado: number | null
  estado: string
  piso: number
  notas: string
  roomType: RoomType
}

export interface Reservation {
  id: number
  guestId: number
  userId: number | null
  responsablePagoId: number | null
  checkInDate: string
  checkOutDate: string
  checkInTime: string
  checkOutTime: string
  numPersonas: number
  status: string
  totalAmount: number
  notas: string
  googleEventId: string | null
  createdDate: string
  guest: Guest
  responsablePago: ResponsablePago | null
  reservationRooms: ReservationRoom[]
  payments: Payment[]
}

export interface ReservationRoom {
  id: number
  reservationId: number
  roomId: number
  pricePerNight: number
  nights: number
  room: Room
}

export interface Payment {
  id: number
  reservationId: number
  amount: number
  method: string
  paymentDate: string
  reference: string
}

export interface ResponsablePago {
  id: number
  razonSocial: string
  cuit: string
  posicionIva: string
  telefono: string
  email: string
  pais: string
  provincia: string
  ciudad: string
  calle: string
  fechaAlta: string
}

export interface DashboardData {
  totalReservations: number
  activeReservations: number
  totalGuests: number
  totalRooms: number
  availableRooms: number
  recentReservations: Reservation[]
  revenue: number
  roomsByStatus: { estado: string; count: number }[]
  upcomingCheckIns: Reservation[]
  upcomingCheckOuts: Reservation[]
  pendingPreRegistros: number
  revenueByMonth: { month: string; total: number }[]
}

export interface PreRegistro {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  checkInDate: string | null
  checkOutDate: string | null
  personas: number
  mensaje: string
  estado: "Pendiente" | "Contactado" | "Convertido" | "Descartado"
  origen: string
  createdAt: string
  updatedAt: string
}

export interface RegistroAcompanante {
  nombres: string
  apellidos: string
  tipoDocumento: string
  numeroDocumento: string
  esMenor: boolean
  permisoUrl: string
}

export interface RegistroDocumento {
  persona: string
  url: string
}

export interface RegistroHuesped {
  id: number
  numeroReserva: string
  numeroHabitacion: string
  fechaLlegada: string | null
  fechaSalida: string | null
  nombres: string
  apellidos: string
  tipoDocumento: string
  numeroDocumento: string
  fechaNacimiento: string | null
  email: string
  telefono: string
  profesion: string
  origen: string
  numeroPersonas: number
  acompanantes: string // JSON de RegistroAcompanante[]
  documentosIdentidad: string // JSON de RegistroDocumento[]
  autorizaInfo: boolean
  aceptaReglamento: boolean
  aceptaEscnna: boolean
  aceptaContrato: boolean
  firmaUrl: string
  estado: "Pendiente" | "Revisado" | "Aprobado" | "Rechazado"
  createdAt: string
  updatedAt: string
}

export interface EscnnaStep {
  id: number
  title: string
  icon: string
  completed: boolean
  data: Record<string, any>
}
