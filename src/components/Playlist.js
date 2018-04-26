import React, { Component } from 'react'

import { AddSong } from '../actions/actions.js'
import { UpdateSong } from '../actions/actions.js'
import { RemoveSong } from '../actions/actions.js'
import { SetPlaylistId } from '../actions/actions.js'
import { AddSongsToPlaylist } from '../actions/actions.js'
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux'


import * as firebase from 'firebase'

import SongItem from '../components/SongItem'
import User from './User'

let id = 0

class Playlist extends Component {

  constructor(){
    super()
  }

  componentDidMount = () => {
    firebase.database().ref().child('songs').orderByKey().on('child_added', snap => {
      this.props.AddSong(snap.val())
      this.addSongToPlaylist(snap.val())
    })

    firebase.database().ref().child('songs').orderByKey().on('child_changed', snap => {
      this.props.UpdateSong(snap.val())
    })

    firebase.database().ref().child('songs').orderByKey().on('child_removed', snap => {
      this.props.RemoveSong(snap.val())
      this.removeSongFromPlaylist(snap.val())
    })

  }

  createPlaylist = () => {
    console.log('here')
    fetch(`https://api.spotify.com/v1/users/${this.props.currentUser.id}/playlists`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({name: "songs", public: true})
    })
    .then ( res => res.json())
    .then ( json => this.props.SetPlaylistId(json.id))
  }

  addSongToPlaylist = (song) => {
    if(this.props.playlistID !== "") {
      fetch(`https://api.spotify.com/v1/users/${this.props.currentUser.id}/playlists/${this.props.playlistID}/tracks`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({"uris": [song.URI]})
      })
      .then(res => res.json())
      .then(json => {console.log(json)})
    }
  }

  removeSongFromPlaylist = (song) => {
    if(this.props.playlistID !== "") {
      fetch(`https://api.spotify.com/v1/users/${this.props.currentUser.id}/playlists/${this.props.playlistID}/tracks`, {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({"tracks": [{"uri": song.URI}]})
      })
      .then(res => res.json())
      .then(json => {console.log(json)})
    }
  }

  // componentDidUpdate = () => {
  //   let addToQueue = this.props.songs.filter(song => song.inPlaylist === false)
  //   let uris = addToQueue.map( song => song.URI)
  //   console.log(uris);
  //   if ((this.props.playlistID !== "") && ( uris !== [])) {
  //
  //     fetch(`https://api.spotify.com/v1/users/${this.props.currentUser.id}/playlists/${this.props.playlistID}/tracks`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-type': 'application/json',
  //         'Accept': 'application/json',
  //         'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  //       },
  //       body: JSON.stringify({"uris": uris})
  //     })
  //     .then(res => res.json())
  //     .then(json => {
  //       addToQueue.forEach(song => {
  //         var updates = {}
  //         updates['/songs/' + song.id + '/inPlaylist'] = true
  //         var updateStatus = firebase.database().ref().update(updates)
  //       })
  //     })
  //   }
  // }


  renderStore = () => {
    return this.props.songs !== [] ? this.props.songs.map(song => {
      id++
      return <SongItem key={song.id} datum={song}/>
    }) : null
  }

  onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index
  }

  renderUsers = () => {
    let userArray = []

    this.props.songs !== [] ? this.props.songs.map(song => {
      userArray.push(song.user)
    }) : null

    let uniques = userArray.filter(this.onlyUnique)

    return uniques.map(user => <User key={user} datum={user}/>)
  }


  render(){
    return(
      <div>
        <button onClick={this.createPlaylist}>I AM THE DJ</button>
        PLAYLIST
          {this.renderStore()}
        USERLIST
          {this.renderUsers()}
      </div>
    )
  }


}

  const mapStateToProps = state => {
    // debugger
    return {songs: state.songs, currentUser: state.currentUser, playlistID: state.playlistID}
  }

  const mapDispatchToProps = dispatch => {
    return bindActionCreators({
      AddSong, UpdateSong, RemoveSong, SetPlaylistId, AddSongsToPlaylist
    }, dispatch)
  }

export default connect(mapStateToProps, mapDispatchToProps)(Playlist)
