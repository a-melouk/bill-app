/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom'
import { localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES } from '../constants/routes'
import NewBill from '../containers/NewBill.js'
import NewBillUI from '../views/NewBillUI.js'
import mockedBills from '../__mocks__/store.js'

describe('Given I am connected as an employee', () => {
  describe('When I download a file with an incorrect extension', () => {
    test('Then an alert should be displayed', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })

      const inputFile = screen.getByTestId('file')
      fireEvent.change(inputFile, {
        target: {
          files: [new File(['file'], 'name.zip', { type: 'application/zip' })],
        },
      })
      expect(newBill.validFileUpload).toBe(false)
    })
  })

  describe('When I download a file with a correct extension', () => {
    test('Then the verification will pass and no alert is displayed', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockedBills,
        localStorage: window.localStorage,
      })

      const inputFile = screen.getByTestId('file')
      fireEvent.change(inputFile, {
        target: {
          files: [new File(['file'], 'name.jpg', { type: 'image/jpg' })],
        },
      })
      expect(newBill.validFileUpload).toBe(true)
    })
  })

  describe('When I upload a file with a correct extension', () => {
    test('Then the file should be uploaded', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      })

      const validBill = {
        email: 'employee@test.tld',
        type: 'Transports',
        name: 'Valid file',
        amount: 123,
        date: '2024-01-08',
        vat: '70',
        pct: 20,
        commentary: 'This is a bill with a correct file type',
        fileName: 'img1.png',
        status: 'pending',
      }

      screen.getByTestId('expense-type').value = validBill.type
      screen.getByTestId('expense-name').value = validBill.name
      screen.getByTestId('amount').value = validBill.amount
      screen.getByTestId('datepicker').value = validBill.date
      screen.getByTestId('vat').value = validBill.vat
      screen.getByTestId('pct').value = validBill.pct
      screen.getByTestId('commentary').value = validBill.commentary
      newBill.fileUrl = validBill.fileUrl
      newBill.fileName = validBill.fileName

      const mockHandleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', mockHandleSubmit)
      fireEvent.submit(form)

      expect(mockHandleSubmit).toHaveBeenCalled()
    })
  })
})
