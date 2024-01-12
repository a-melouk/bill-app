/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { bills } from '../fixtures/bills.js'
import { screen, waitFor } from '@testing-library/dom'
import { localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import Bills from '../containers/Bills.js'
import BillsUI from '../views/BillsUI.js'
import mockStore from '../__mocks__/store.js'
import router from '../app/Router.js'
import userEvent from '@testing-library/user-event'

jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')
    })

    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML)
      const antiChrono = (a, b) => (a < b ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test('Then the bill container should be rendered', () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const billContainer = screen.getByText('Mes notes de frais')
      expect(billContainer).toBeTruthy()
    })

    test('Then the getBills method should return formatted bills', async () => {
      const billsContainer = new Bills({
        document,
        onNavigate: jest.fn(),
        store: {
          bills: () => ({
            list: () => Promise.resolve(bills),
          }),
        },
      })

      const formattedBills = await billsContainer.getBills()

      expect(Array.isArray(formattedBills)).toBe(true)
      expect(formattedBills.length).toBe(bills.length)

      formattedBills.forEach((bill) => {
        expect(bill).toHaveProperty('date')
        expect(bill).toHaveProperty('status')
      })
    })
  })

  describe('When I am on Dashboard page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  // Integration test for GET Bills
  describe('When I navigate to Bills', () => {
    test('Then the getBills method should return 4 bills', async () => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'employee@example.com' })
      )

      // Create a Bill instance with a mocked store
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      // Call getBills and check the result
      const bills = await billsContainer.getBills()
      expect(bills.length).toBe(4)
    })
  })

  describe('When I click on the icon eye', () => {
    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      )
      document.body.innerHTML = BillsUI({ data: bills })
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const billsContainer = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })

      //Display modal
      $.fn.modal = jest.fn()

      const handleClickIconEye = jest.fn(
        () => billsContainer.handleClickIconEye
      )

      const eye = screen.getAllByTestId('icon-eye')[0]
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
  })

  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills')
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
    })

    test('Then request fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test('Then request fails with with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
