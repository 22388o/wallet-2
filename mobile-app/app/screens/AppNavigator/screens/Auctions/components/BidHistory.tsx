import { View } from '@components'
import { ThemedFlatList, ThemedText, ThemedView } from '@components/themed'
import { VaultAuctionBatchHistory } from '@defichain/whale-api-client/dist/api/loan'
import { useWhaleApiClient } from '@shared-contexts/WhaleContext'
import { RootState } from '@store'
import { fetchBidHistory } from '@store/auctions'
import { tailwind } from '@tailwind'
import { translate } from '@translations'
import BigNumber from 'bignumber.js'
import { useEffect } from 'react'
import NumberFormat from 'react-number-format'
import { useDispatch, useSelector } from 'react-redux'
import { ActiveUsdValue } from '../../Loans/VaultDetail/components/ActiveUsdValue'
import { useBidTimeAgo } from '../hooks/BidTimeAgo'

interface BidHistoryProps {
  vaultId: string
  liquidationHeight: number
  batchIndex: number
  loanDisplaySymbol: string
  loanActivePrice: string
}

export function BidHistory (props: BidHistoryProps): JSX.Element {
  const client = useWhaleApiClient()
  const dispatch = useDispatch()
  const blockCount = useSelector((state: RootState) => state.block.count) ?? 0
  const bidHistory = useSelector((state: RootState) => state.auctions.bidHistory)

  useEffect(() => {
    dispatch(fetchBidHistory({
      vaultId: props.vaultId,
      liquidationHeight: props.liquidationHeight,
      batchIndex: props.batchIndex,
      client: client
    }))
  }, [blockCount, props])

  return (
    <ThemedFlatList
      data={bidHistory}
      renderItem={({ item, index }: { item: VaultAuctionBatchHistory, index: number }): JSX.Element => {
        return (
          <BidHistoryItem
            vaultLiquidationHeight={props.liquidationHeight}
            bidIndex={item.index}
            bidAmount={item.amount}
            loanDisplaySymbol={props.loanDisplaySymbol}
            bidderAddress={item.from}
            loanActivePrice={props.loanActivePrice}
            isLatestBid={index === 0}
            bidBlockTime={item.block.time}
          />
        )
      }}
      keyExtractor={(item: VaultAuctionBatchHistory) => item.id}
      contentContainerStyle={tailwind('p-4')}
      light={tailwind('bg-gray-50')}
      style={tailwind('-mb-1')}
    />
  )
}

interface BidHistoryItemProps {
  vaultLiquidationHeight: number
  bidIndex: number
  bidAmount: string
  loanDisplaySymbol: string
  bidderAddress: string
  loanActivePrice: string
  isLatestBid: boolean
  bidBlockTime: number
}
function BidHistoryItem (props: BidHistoryItemProps): JSX.Element {
  const bidTime = useBidTimeAgo(props.bidBlockTime)
  return (
    <ThemedView
      light={tailwind({ 'bg-white border-gray-100': props.isLatestBid, 'bg-gray-100 border-gray-100': !props.isLatestBid })}
      dark={tailwind({ 'bg-gray-800 border-gray-900': props.isLatestBid, 'bg-gray-900 border-gray-800': !props.isLatestBid })}
      style={tailwind('border rounded px-4 py-3 mb-1')}
    >
      <View style={tailwind('flex flex-row justify-between mb-2 items-center')}>
        <ThemedView
          style={tailwind('px-1')}
          light={tailwind('bg-blue-500 text-white')}
          dark={tailwind('bg-darkblue-500 text-black')}
        >
          <ThemedText
            style={tailwind('text-2xs')}
            light={tailwind('text-white')}
            dark={tailwind('text-black')}
          >
            {translate('components/BidHistory', 'BID #{{bidIndex}}', { bidIndex: props.bidIndex })}
          </ThemedText>
        </ThemedView>
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {bidTime}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row justify-between items-center')}>
        <NumberFormat
          value={props.bidAmount}
          thousandSeparator
          decimalScale={8}
          displayType='text'
          renderText={value =>
            <ThemedText
              light={tailwind('text-gray-700')}
              dark={tailwind('text-gray-300')}
              style={tailwind('text-sm font-medium')}
              testID={`bid_${props.loanDisplaySymbol}_amount`}
            >
              {value}
              <ThemedText
                style={tailwind('text-xs')}
              >
                {` ${props.loanDisplaySymbol}`}
              </ThemedText>
            </ThemedText>}
        />
        <ThemedText
          numberOfLines={1}
          ellipsizeMode='middle'
          style={tailwind('w-4/12 text-xs font-medium')}
        >
          {props.bidderAddress}
        </ThemedText>
      </View>
      <View style={tailwind('flex flex-row justify-between')}>
        <ActiveUsdValue price={new BigNumber(props.bidAmount).multipliedBy(props.loanActivePrice)} />
        <ThemedText
          light={tailwind('text-gray-500')}
          dark={tailwind('text-gray-400')}
          style={tailwind('text-xs')}
        >
          {translate('components/BidHistory', 'Bidder ID')}
        </ThemedText>
      </View>
    </ThemedView>
  )
}
