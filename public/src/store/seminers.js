import { firebaseMutations, firebaseAction } from 'vuexfire'
import firebaseApp from './../../firebase_setup'
import * as constants from './constants'

const db = firebaseApp.database()
const seminersRef = db.ref('seminers/')
const mySeminersRef = db.ref('mySeminers/')
const attendSeminersRef = db.ref('attendSeminers/')

const seminerAttendUsersRef = (seminerId) => {
  return db.ref('seminers/' + seminerId + '/attendUsers')
}
const currentMySeminersRef = (currentUserId, seminerId) => {
  return db.ref('mySeminers/' + currentUserId + '/' + seminerId)
}
const seminerStatusRef = (seminerId) => {
  return db.ref('seminers/' + seminerId + '/seminerDate/status')
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
      removeSeminersRef.remove()

      const removeMySeminersRef = currentMySeminersRef(currentUserId, value)
      removeMySeminersRef.remove()
    }),
    // seminer status update
    [constants.UPDATE_SEMINER_STATUS]: firebaseAction((context, value) => {
      const seminer = seminerStatusRef(value.seminerId)
      seminer.set(value.status)
    }),
    // Getters constants
    [constants.GET_SEMINERS]: firebaseAction(({ bindFirebaseRef }) => {
      bindFirebaseRef('seminers', seminersRef, { wait: true })
    }),
    [constants.GET_ATTEND_SEMINERS]: firebaseAction(({ bindFirebaseRef }) => {
      bindFirebaseRef('attendSeminers', attendSeminersRef, { wait: true })
    }),
    [constants.GET_CURRENT_MY_SEMINERS]: firebaseAction(({ bindFirebaseRef }) => {
      bindFirebaseRef('mySeminers', mySeminersRef, { wait: true })
    })
  },
  getters: {
    getSeminers: state => state.seminers,
    getMySeminers: state => state.mySeminers,
    getAttendSeminers: state => state.attendSeminers,
    getSeminerBySeminerId: (state, getters, rootState) => (seminerId) => {
      const seminers = state.seminers
      if (seminers[seminerId]) {
        let seminer = seminers[seminerId]
        return seminer
      } else {
        return {}
      }
    },
    getCurrentMyseminers: (state, getters, rootState) => (currentUserId) => {
      let returnCurrentMySeminers = {}
      const seminers = state.seminers
      const stateMySeminsers = state.mySeminers
      if (stateMySeminsers[currentUserId]) {
        for (let seminerId in stateMySeminsers[currentUserId]) {
          if (seminers[seminerId]) {
            returnCurrentMySeminers[seminerId] = seminers[seminerId]
          }
        }
        return returnCurrentMySeminers
      }
      return {}
    },
    getCurrentAttendSeminers: (state, getters, rootState) => (currentUserId) => {
      let returnCurrentAttendSeminers = {}
      const seminers = state.seminers
      const stateAttendSeminers = state.attendSeminers
      if (stateAttendSeminers[currentUserId]) {
        for (let seminerId in stateAttendSeminers[currentUserId]) {
          if (seminers[seminerId]) {
            returnCurrentAttendSeminers[seminerId] = seminers[seminerId]
          }
        }
        return returnCurrentAttendSeminers
      }
      return {}
    },
    getLatedAttendSeminer: (state, getters, rootState) => {
      if (getters.getCurrentAttendSeminers(rootState.currentUserId)) {
        let currentAttendSeminers = getters.getCurrentAttendSeminers(rootState.currentUserId)
        let sortedSeminers = []
        sortedSeminers = Object.values(currentAttendSeminers).sort(function (a, b) {
          return parseInt(a.seminerDate.start) - parseInt(b.seminerDate.start)
        })
        console.log(sortedSeminers[0])
        return sortedSeminers[0]
      }
    }
  }
}
