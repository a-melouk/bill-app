/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom'
import { localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES } from '../constants/routes'
import NewBill from '../containers/NewBill.js'
import NewBillUI from '../views/NewBillUI.js'

describe('Given I am connected as an employee', () => {
  describe('When I download a file with an incorrect extension', () => {
    test('Then an alert should be displayed', () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {})

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      document.body.innerHTML = NewBillUI()

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
      expect(alertMock).toHaveBeenCalled()
    })
  })
})
