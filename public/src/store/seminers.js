import { firebaseMutations, firebaseAction } from 'vuexfire'
import firebaseApp from './../../firebase_setup'
import * as constants from './constants'

const db = firebaseApp.database()
const seminersRef = db.ref('seminers/')
const mySeminersRef = db.ref('mySeminers/')
const attendSeminersRef = db.ref('attendSeminers/')

const seminerAttendUsersRef = (seminerId) => {
  return db.ref('seminers/' + semimerId + '/attendUsers')
}
const currentMySeminersRef = (currentUserId, seminerId) => {
  return db.ref('mySeminers/' + currentUserId + '/' + seminerId)
}

export const seminersModule = {
  namespaced: true,
  state: {
    seminers: {},
    mySeminers: {},
    attendSeminers: {}
  },
  mutations: {
    ...firebaseMutations
  },
  actions: {
    // 勉強会を新規登録した時の処理
    [constants.SET_NEW_SEMINER]: firebaseAction((context, value) => {
      const currentUserId = context.rootState.currentUserId
      const setSeminersRef = seminersRef.push()
      setSeminersRef.set(value)

      const setCurrentMySeminersRef = currentMySeminersRef(currentUserId, setSeminersRef.getKey())
      setCurrentMySeminersRef.set(1)
    }),
    // 勉強会に参加した時の処理
    [constants.ADD_USER_TO_SEMINER]: firebaseAction((context, value) => {
      const currentUserId = context.rootState.currentUserId
      const setAttendSeminersRef = attendSeminersRef.child(currentUserId).child(value)
      setAttendSeminersRef.set(1)
      const setSeminerAttendUsersRef = seminerAttendUsersRef(value).child(currentUserId)
      setSeminerAttendUsersRef.set(1)
    }),
    // 登録した自分が主催の勉強会を削除した時の処理
    [constants.REMOVE_MY_SEMINER]: firebaseAction((context, value) => {
      const currentUserId = context.rootState.currentUserId
      const removeSeminersRef = seminersRef.child(value)
      removeSeminerRef.remove()

      const removeMySeminersRef = currentMySeminersRef(currentUserId, value)
      removeMySeminerRef.remove()
    }),
    // Getters constants
    [constants.GET_SEMINERS]: firebaseAction(({ bindFirebaseRef }) => {
      bindFirebaseRef('seminers', seminerRef, { wait: true })
    }),
    [constants.GET_ATTEND_SEMINERS]: firebaseAction(({ bindFirebaseRef }) => {
      bindFirebaseRef('attendSeminers', attendSeminersRef, { wait: true })
    }),
    [constants.GET_CURRENT_MY_SEMINERS]: firebaseAction(({ bindFirebaseRef }) => {
      bindFirebaseRef('mySeminers', currentMySeminersRef, { wait: true })
    })
  },
  getters: {
    getSeminers: state => state.seminers,
    getMySeminers: state => state.mySeminers,
    getAttendSeminers: state => state.attendSeminers,
    getSeminerBySeminerId: (state, getters, rootState) => (seminerId) => {
      let returnSeminer = {}
      const seminers = state.seminers
      if (seminers.seminerId) {
        seminer = seminers.seminerId
        return returnSeminer
      } else {
        return 'not exist seminer'
      }
    },
    getCurrentMySeminers: (state, getters, rootState) => (currentUserId) => {
      const mySeminers = state.mySeminers
      if (stateParticipateSeminers[rootState.currentUserId]) {
        return stateParticipateSeminers[rootState.currentUserId]
      } else {
        return {'noseminers': 'noseminers'}
      }
    },
    getCurrentMyseminers: (state, getters, rootState) => (currentUserId) => {
      let returnMySeminers = {}

      const seminers = state.seminers
      const stateMySeminsers = state.mySeminers

      if (stateMySeminsers[currentUserId]) {
        for (let seminerId in stateMySeminsers[currentUserId]) {
          if (seminers[seminerId]) {
            returnMySeminers[seminerId] = seminers[seminerId]
          }
        }
      }

      return returnMySeminers
    }
  }
}
