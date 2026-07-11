import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router"
import PaymentModal from "../components/PaymentModal"

function TestWrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      {children}
    </QueryClientProvider>
  )
}

describe("PaymentModal", () => {
  const mockOnClose = () => {}

  it("renders the modal with correct title", () => {
    render(<PaymentModal reservationId={1} totalAmount={150000} onClose={mockOnClose} />, { wrapper: TestWrapper })
    expect(screen.getByText("Registrar Pago")).toBeTruthy()
  })

  it("shows the total amount as default", () => {
    render(<PaymentModal reservationId={1} totalAmount={150000} onClose={mockOnClose} />, { wrapper: TestWrapper })
    const amountInput = screen.getByDisplayValue("150000")
    expect(amountInput).toBeTruthy()
  })

  it("has method select with options", () => {
    render(<PaymentModal reservationId={1} totalAmount={150000} onClose={mockOnClose} />, { wrapper: TestWrapper })
    expect(screen.getByText("Método de pago")).toBeTruthy()
  })

  it("has cancel and confirm buttons", () => {
    render(<PaymentModal reservationId={1} totalAmount={150000} onClose={mockOnClose} />, { wrapper: TestWrapper })
    expect(screen.getByText("Cancelar")).toBeTruthy()
    expect(screen.getByText("Registrar pago")).toBeTruthy()
  })

  it("disables submit with zero amount", () => {
    render(<PaymentModal reservationId={1} totalAmount={0} onClose={mockOnClose} />, { wrapper: TestWrapper })
    const submitBtn = screen.getByText("Registrar pago") as HTMLButtonElement
    expect(submitBtn.disabled).toBe(true)
  })
})
