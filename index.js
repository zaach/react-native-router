'use strict';

var React = require('react-native');

var NavBarContainer = require('./components/NavBarContainer');

var {
    StyleSheet,
    Navigator,
    StatusBarIOS,
    View,
    } = React;


var Router = React.createClass({

    getInitialState: function () {
        return {
            route: {
                name: null,
                index: null
            },
            hideHeader: false,
            dragStartX: null,
            didSwitchView: null,
        }
    },

    /*
     * This changes the title in the navigation bar
     * It should preferrably be called for "onWillFocus" instad >
     * > but a recent update to React Native seems to break the animation
     */
    onDidFocus: function (route) {
        this.setState({route: route});
    },

    onBack: function (navigator) {
        if (this.state.route.index > 0) {
            this.setState({hideHeader: false})
            navigator.pop();

        }
    },

    onForward: function (route, navigator) {
        route.index = this.state.route.index + 1 || 1;
        navigator.push(route);
    },

    customAction: function (opts) {
        this.props.customAction(opts);
    },

    renderScene: function (route, navigator) {
        var me = this;
        var goForward = function (route) {
            route.index = this.state.route.index + 1 || 1;
            this.setState({hideHeader: route.hideNavigationBar})
            navigator.push(route);
        }.bind(this);

        var goBackwards = function () {
            this.onBack(navigator);
        }.bind(this);

        var goToFirstRoute = function () {
            navigator.popToTop()
        };

        var replaceRoute = function (route) {
            route.index = 0
            me.setState({hideHeader: route.hideNavigationBar, route: route})

            navigator.replace(route)
        };

        var customAction = function (opts) {
            this.customAction(opts);
        }.bind(this);

        var didStartDrag = function (evt) {
            var x = evt.nativeEvent.pageX;
            if (x < 28) {
                this.setState({
                    dragStartX: x,
                    didSwitchView: false
                });
                return true;
            }
        }.bind(this);

        // Recognize swipe back gesture for navigation
        var didMoveFinger = function (evt) {
            var draggedAway = ((evt.nativeEvent.pageX - this.state.dragStartX) >
            30);
            if (!this.state.didSwitchView && draggedAway) {
                this.onBack(navigator);
                this.setState({didSwitchView: true});
            }
        }.bind(this);

        // Set to false to prevent iOS from hijacking the responder
        var preventDefault = function (evt) {
            return false;
        };

        var Content = route.component;

        // Remove the margin of the navigation bar if not using navigation bar
        var extraStyling = {};
        if (this.props.hideNavigationBar || this.state.hideHeader) {
            extraStyling.marginTop = 0;
        }

        return (
            <View
                style={[styles.container, this.props.bgStyle, extraStyling]}
                onStartShouldSetResponder={didStartDrag}
                onResponderMove={didMoveFinger}
                onResponderTerminationRequest={preventDefault}>
                <Content
                    name={route.name}
                    index={route.index}
                    data={route.data}
                    toRoute={goForward}
                    toBack={goBackwards}
                    replace={replaceRoute}
                    reset={goToFirstRoute}
                    customAction={customAction}
                />
            </View>
        )

    },

    render: function () {

        // Status bar color
        if (this.props.statusBarColor === "black") {
            StatusBarIOS.setStyle(0);
        } else {
            StatusBarIOS.setStyle(1);
        }

        var navigationBar;

        if (!this.props.hideNavigationBar && !this.state.hideHeader) {
            navigationBar =
                <NavBarContainer
                    style={this.props.headerStyle}
                    navigator={navigator}
                    currentRoute={this.state.route}
                    backButtonComponent={this.props.backButtonComponent}
                    rightCorner={this.props.rightCorner}
                    titleStyle={this.props.titleStyle}
                    toRoute={this.onForward}
                    toBack={this.onBack}
                    customAction={this.customAction}
                />
        }

        return (
            <Navigator
                initialRoute={this.props.firstRoute}
                navigationBar={navigationBar}
                renderScene={this.renderScene}
                onDidFocus={this.onDidFocus}
            />
        )
    }
});


var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        marginTop: 64
    },
});


module.exports = Router;
