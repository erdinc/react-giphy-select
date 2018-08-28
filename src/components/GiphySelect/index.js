import 'isomorphic-fetch';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GiphyList from '../GiphyList';
import styles from './styles.css';

export default class GiphySelect extends Component {
  static propTypes = {
    theme: PropTypes.shape({
      select: PropTypes.string,
      selectInput: PropTypes.string,
      attribution: PropTypes.string,
    }),
    placeholder: PropTypes.string,
    requestDelay: PropTypes.number,
    requestKey: PropTypes.string,
    requestLang: PropTypes.string,
    requestRating: PropTypes.string,
    renderEntry: PropTypes.func,
    onEntrySelect: PropTypes.func,
  };

  static defaultProps = {
    theme: {},
    placeholder: 'Search GIFs',
    requestDelay: 500,
    requestKey: 'dc6zaTOxFJmzC',
    requestLang: '',
    requestRating: 'pg',
    renderEntry: GiphyList.defaultProps.renderEntry,
    onEntrySelect: GiphyList.defaultProps.onEntrySelect,
  };

  state = {
    items: [],
  };

  componentWillMount() {
    this._fetchItems();
  }

  shouldComponentUpdate = () => !this._activeFetch;

  loadNextPage = () => {
    if (this._offset < this._totalCount) {
      this._fetchItems();
    }
  };

  _onQueryChange = e => {
    const query = e.target.value.trim();

    if (this._requestTimer) {
      clearTimeout(this._requestTimer);
      this._requestTimer = null;
    }

    this._requestTimer = setTimeout(() => {
      if (query !== this._query) {
        this._query = query;
        this._offset = 0;
        this._activeFetch = true;
        this.setState({
          items: [],
        });
        this._fetchItems();
      }
    }, this.props.requestDelay);
  }

  _onWheel = e => e.preventDefault();

  _fetchItems = () => {
    const { requestKey, requestLang, requestRating } = this.props;
    let endpoint = '';
    let searchById = false;

    if(this._query.indexOf('id:') > -1){
      endpoint = `${this._query.substring(3)}`;
      searchById = true;
    }
    else if (this._query) {
      endpoint = `search?q=${encodeURIComponent(this._query)}&`;
    }
    else {
      endpoint = 'trending?';
    }
    const offset = this._offset;

    const apiURL = `${location.protocol}//api.giphy.com/v1/gifs/}`;
    let searchURL;
    if(searchById){
      searchURL = `${apiURL}${endpoint}&api_key=${requestKey}`
    }else{
      searchURL = `${apiURL}${endpoint}offset=${offset}&lang=${requestLang}&rating=${requestRating}&api_key=${requestKey}`
    }



    fetch(searchURL)
      .then(response => response.json())
      .then(this._updateItems)
      .catch(console.error); // eslint-disable-line no-console
  }

  _updateItems = response => {
    this._activeFetch = false;
    this.setState(prevState => ({
      items: [...prevState.items, ...response.data],
    }));
    this._offset = response.pagination.offset + response.pagination.count;
    this._totalCount = response.pagination.total_count;
  }

  _theme = {
    select: styles.select,
    selectInput: styles.selectInput,
    attribution: styles.attribution,
    ...this.props.theme,
  };
  _query = '';
  _requestTimer = null;
  _offset = 0;
  _totalCount = 0;
  _activeFetch = false;

  render() {
    const { placeholder, renderEntry, onEntrySelect } = this.props;
    const theme = this._theme;

    return (
      <div className={theme.select} onWheel={this._onWheel}>
        <input
          className={theme.selectInput}
          placeholder={placeholder}
          onChange={this._onQueryChange}
        />
        <GiphyList
          theme={theme}
          items={this.state.items}
          renderEntry={renderEntry}
          onEntrySelect={onEntrySelect}
          loadNextPage={this.loadNextPage}
        />
        <div className={theme.attribution}>Powered by Giphy</div>
      </div>
    );
  }
}
