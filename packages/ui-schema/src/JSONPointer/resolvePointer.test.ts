import { expect, describe } from '@jest/globals'
import { resolvePointer } from './resolvePointer'
import { fromJS } from 'immutable'
import { testCases } from './JSONPointer.mock'

describe('JSONPointer', () => {
    test.each(testCases)(
        'resolvePointer() %j',
        (testData) => {
            expect(
                resolvePointer(testData.pointer, fromJS(testData.data))
            ).toBe(testData.value)
        }
    )
})
