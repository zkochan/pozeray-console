;(function () {
	function PozerayUI() {
		var template = 
			'<div class="pozeray-icon">pozeray</div>' +
			'<div class="pozeray-console-container">' +
				'<div class="pozeray-console-filters-container">' +
					'<label>' +
						'Area' +
						'<select id="messageAreas">' +
							'<option value="">All</option>' +
						'</select>' +
					'</label>' +
					'<label>' +
						'Type' +
						'<select id="messageTypes">' +
							'<option value="">All</option>' +
							'<option value="error">Errors</option>' +
							'<option value="warn">Warnings</option>' +
							'<option value="info">Info</option>' +
							'<option value="log">Logs</option>' +
							'<option value="debug">Debug</option>' +
						'</select>' +
					'</label>' +
					'<label><input id="autoscroll" type="checkbox" checked> autoscroll</label>' +
					'<input id="consoleFilter" type="text" placeholder="Filter">' +
					'<button id="clearButton">Clear</button>' +
					'<span class="pozeray-console-close"></span>' +
				'</div>' +
				'<div class="messages-container"></div>' +
			'</div>';

		$('body').append(template);
		

		// DOM elements
		var $messageAreas = $('#messageAreas'),
			$messageTypes = $('#messageTypes'),
			$autoscroll = $('#autoscroll'),
			$clearButton = $('#clearButton'),
			$consoleFilter = $('#consoleFilter'),
			$thumbnail = $('.pozeray-icon'),
			$consoleContainer = $('.pozeray-console-container'),
			$closeIcon = $('.pozeray-console-close'),
			$messagesContainer = $('.messages-container');

		// Models
		var areas = [],
			messages = new (function Messages() {
				var self = this,
					messages = [];

				function isActiveMessage(message) {
					return (!$messageAreas.val() || $messageAreas.val() == message.area) &&
						(!$messageTypes.val() || $messageTypes.val() == message.type) &&
						(!$consoleFilter.val() || message.body.indexOf($consoleFilter.val()) > -1);
				}

				function onMessageAreaClick(e) {
					var $this = $(e.currentTarget);
					$messageAreas.val($this.text());
					self.refilter();
				}

				function insertMessageIntoDom(message) {
					var $newMessage = $(
						'<div class="message-container ' + message.type + '">' +
							'<span class="message-area">' + message.area + '</span>' +
							message.body +
						'</div>'
					);
					$messagesContainer.append($newMessage);
					$newMessage.find('.message-area').click(onMessageAreaClick);
				}

				this.clear = function () {
					messages = [];
					$messagesContainer.empty();
				};

				this.add = function (message) {
					messages.push(message);
					if (isActiveMessage(message)) {
						insertMessageIntoDom(message);
						$consoleContainer.trigger('message:add');
					}
				};

				this.refilter = function () {
					$messagesContainer.empty();
					messages.forEach(function (message) {
						if (isActiveMessage(message)) {
							insertMessageIntoDom(message);
						}
					});
					$consoleContainer.trigger('message:add');
				};
			}),
			autoscroll = true;

		// Attach events
		function toggleConsole() {
			$thumbnail.toggle();
			$consoleContainer.toggle();
		}

		$thumbnail.click(toggleConsole);
		$closeIcon.click(toggleConsole);

		$messageAreas.click(messages.refilter);
		$messageTypes.click(messages.refilter);
		$consoleFilter.keyup(messages.refilter);

		$consoleContainer.on('message:add', function onMessageAdd() {
			if ($autoscroll.is(':checked')) {
			    $messagesContainer.animate({
			    	scrollTop: $messagesContainer[0].scrollHeight
			    });
			}
		});

		$clearButton.click(messages.clear);

		pozeray.listen(function (message) {
			if (areas.indexOf(message.area) === -1) {
				areas.push(message.area);
				$messageAreas.append('<option value="' + message.area + '">' + message.area + '</option>');
			}
			messages.add(message);
		});

		/*$messagesContainer.scroll(function () {
			$autoscroll.removeAttr('checked');
		});*/

		$(window).keydown(function (e) {
			if (e.keyCode == 90 /*z*/) {
				toggleConsole();
			}
		});
	}

	$(function () {
		try {
			new PozerayUI();
		} catch (err) {
			console.error(err.message);
		}
	});
})();